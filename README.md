# Auth0 User Management Service

A service that allows "admin" users within an Auth0 account to manage other users.

## Overview

Many Auth0 customers have built apps that don't have their own hosted backend. Instead they use Auth0 itself as well as a collection of other services to preform backend operations. At Auth0 we like to call this a "backendless" app.

However, there are a few scenarios where having your own backend is handy. A common one is when you want to manage the users in your Auth0 account with your own app (i.e. an admin app) instead of using the Auth0 Dashboard. To do this your app needs to use the [Auth0 Management API](https://auth0.com/docs/api/v2). Unfortunately you can't safely call this API from most frontend applications because it requires you to embed secrets (i.e. an Auth0 API access token) in your app, and secrets can usually only be safely stored on the server side (i.e. in a backend). This project provides you with an easy and secure solution to this problem.

## Key features

* Quickly set up a REST API service that can be used by a frontend app in your Auth0 account to manage your users without having to build your own from scratch
* Provision and deploy your own instance of this service in a snap, since its a [Webtask](https://webtask.io)
* Authenticate and authorize "admin" users with a [JWT](http://jwt.io) that contains the claim data you require
* Endpoints exposed by the service simply reverse-proxy calls to associated Users resource endpoints in the Auth0 Management API, which provides maximum flexibility and future-proofing
* Your service instance gains the necessary access to the Auth0 Management API with an API access token that you configure

## Demo

To see this service in action, check out this [sample frontend Angular app](http://twistedstream.github.io/auth0-user-management-service), which calls a demo instance of the Webtask service. You can view the source to that frontend app [here](https://github.com/twistedstream/auth0-user-management-service/tree/gh-pages).

## Provision

Before you can use the service, you need to provision an instance of it that works with your Auth0 account. Provisioning is done by creating a Webtask that uses the source code in this GitHub repo. If you don't already have a Webtask account, you can easily set one up using your Auth0 account by following the steps [here](https://manage.auth0.com/#/account/webtasks).

Then to provision your service, use the following [Webtask CLI](https://webtask.io/cli) command:

```bash
wt create -n user_management \
  --no-parse --no-merge \
  -p "WEBTASK_PROFILE" \
  -s client_id="CLIENT_ID" \
  -s client_secret="CLIENT_SECRET" \
  -s domain="DOMAIN" \
  -s admin_authz="ADMIN_AUTHZ" \
  -s api_access_token="API_ACCESS_TOKEN"
  https://raw.githubusercontent.com/twistedstream/auth0-user-management-service/master/webtask.js
```

where:
* `WEBTASK_PROFILE`: the name of the profile you set up when setting up your Webtask account
* `CLIENT_ID`/`CLIENT_SECRET`: The Client ID and Secret of the Auth0 app that will be calling this service, which means its also the app that will be using Auth0 to authenticate the "admin" user.
* `DOMAIN`: your Auth0 account domain
* `ADMIN_AUTHZ`: A JavaScript function that operates on the JWT's claims and determines if the identity is authorized to manage users in the Auth0 account.  
Example: `"function (claims) { return claims.admin === true; }"`
* `API_ACCESS_TOKEN`: an Auth0 Management API **access token** that will give your service the required access to manage your Account users. Obtain one by visiting the [API Explorer](https://auth0.com/docs/api/v2) and generating a token with the following scopes: `read:users`, `create:users`, `delete:users`, `update:users`, `update:users_app_metadata`

> NOTE: We don't need to worry about configuring the service with CORS as the Webtask infrastructure automatically responds with CORS headers that allow all origins. This is secure because we don't allow access to the service without a valid JWT Bearer token.

If successful, the output of the command will be a URL that looks something like this:

```
https://sandbox.it.auth0.com/api/run/your-account/user_management
```

> Your URL may contain a `?webtask_no_cache=1` at the end, which you can ignore when using the webtask in the next section.

## Usage

The following endpoints are currently supported and include links to their proxied Auth0 Management API endpoints for documentation reference:

* **GET** `/users`: [List or search users](https://auth0.com/docs/api/v2#!/Users/get_users)
* **POST** `/users`: [Create (provision) a user](https://auth0.com/docs/api/v2#!/Users/post_users)
* **GET** `/users/{id}`: [Get a user](https://auth0.com/docs/api/v2#!/Users/get_users_by_id)
* **DELETE** `/users/{id}`: [Delete a user](https://auth0.com/docs/api/v2#!/Users/delete_users_by_id)
* **PATCH** `/users/{id}`: [Update a user](https://auth0.com/docs/api/v2#!/Users/patch_users_by_id)

For example, to provision a new user using your instance of the service, your Client application would make the equivalent of the following cURL call (e.g. via jQuery `$.ajax()` or Angular `$http()`):

```bash
curl -X POST -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ADMIN_USER_JWT' \
  -H 'Content-Type: application/json' \
  -d '{"connection":"your-connection", "email":"foo@bar.com", "password":"secret"}' \
  https://sandbox.it.auth0.com/api/run/your-account/user_management/users
```

where `ADMIN_USER_JWT` is the `id_token` obtained when the admin user logged into the Client application.

## How it works

Once up and running, your service instance will expose a set of endpoints that will allow an authorized user to manage users in your Auth0 account. These endpoints essentially reverse-proxy to equivalent endpoints of the [Users resource](https://auth0.com/docs/api/v2#!/Users/get_users) in the Auth0 Management API. The difference is that your service *authenticates* each request by expecting a JWT passed as a [bearer token](https://tools.ietf.org/html/draft-ietf-oauth-v2-bearer-20#section-2.1) that has been signed with the same Client Secret for which the service has been configured. It also *authorizes* the request using the configured `authz_expression`, which is evaluated against the JWT payload for expected claim state. Once the request has been authenticated and authorized, the service then proxies the call to the corresponding Auth0 API Users endpoint, which it can access using the configured `api_access_token`.

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
