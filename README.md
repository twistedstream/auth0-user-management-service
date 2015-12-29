# Auth0 User Management Service: Demo Frontend

This `gh-pages` branch contains a sample frontend Angular app that demonstrates interactions with a demo instance of the **Auth0 User Management Service**. You can learn more about the service and view its source in the [main branch](https://github.com/twistedstream/auth0-user-management-service).

You can use the app here:

http://twistedstream.github.io/auth0-user-management-service

and log in as an admin user with these credentials:
* Email: `peter+ums_admin@auth0.com`
* Password: `adm1n_Passw0rd`

## Read Only

For purposes of a public demo, the `api_access_token` configured with the demo instance of the backend service only contains read scopes. However, you can still see all the API calls that the frontend app attempts to make (i.e. in Chrome Developer Tools), even if the write calls result in errors.

## Getting Connections

In order to create a user using the [POST `/api/v2/users` endpoint](https://auth0.com/docs/api/v2#!/Users/post_users), you need to pass a `connection` name. This demo frontend acquires a list of possible connections and presents them to the user by calling the `getConnections()` function of the [auth0.js](https://auth0.com/docs/libraries/auth0js) instance embedded in the `auth` Angular dependency, which you can see [here](create/create.js#L33).
