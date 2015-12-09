# Auth0 User Management Service

A service that allows "admin" users within an Auth0 account to manage other users.

## Key features

* Authorize an admin user by configuring the service with a function that evaluates the claims within an inbound Bearer token (JWT)
* Gain the necessary access to the [Auth0 Management API](https://auth0.com/docs/api/v2) by configuring the service with an API access token and a domain
* Endpoints exposed by the service simply proxy calls to associated Users resource endpoints in the Management API for maximum flexiblity and future-proofing
* The service is implemented as a [webtask](https://webtask.io) so instances can easily be provisioned and deployed as a user-managament backend for any Auth0 account

## Provision

Before you can use the service, you need to provision an instance of it that works with your Auth0 account. The easiest way to get started with Webtasks, is to set up the free container just for your account by following the steps [here](https://manage.auth0.com/#/account/webtasks).

Then to provision your service, use the following command:

```bash
wt create --name user_management \
  --secret api_access_token="API_ACCESS_TOKEN" \
  --secret client_secret="CLIENT_SECRET" \
  --secret domain="DOMAIN" \
  --secret authz_func="AUTHZ_FUNC" \
  --secret cors_allowed_domains="CORS_ALLOWED_DOMAINS" \
  https://github.com/twistedstream/auth0-user-management-service/webtask.js
```

where:
* `API_ACCESS_TOKEN`: an Auth0 Management API **access token** that will give your service the required access to your Account users by visiting the [API Explorer](https://auth0.com/docs/api/v2) and generating token with the following scopes: `read:users`, `create:users`, `delete:users`, `update:users`, `update:users_app_metadata`
* `CLIENT_SECRET`: the Client Secret of the Auth0 app that will be calling this service, which means its also the app that will be using Auth0 to authenticate the "admin" user.
* `DOMAIN`: your Auth0 account domain
* `AUTHZ_FUNC`: a JavaScript function, that, given a JWT payload, will return `true` if the identity matches your criteria for a user authorized to manage your users. Example: `function (payload) { return payload.admin === true; }`
* `CORS_ALLOWED_DOMAINS`: a list of domains that your service will permit via CORS

The output of the command will be a URL that looks something like this:

```
https://sandbox.it.auth0.com/api/run/YOUR_ACCOUNT/user_management
```

## Usage

(more)

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
