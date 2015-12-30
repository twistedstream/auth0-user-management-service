var jwt = require('express-jwt');
var Express = require('express');
var Webtask = require('webtask-tools');
var _ = require('lodash');
var request = require('request');
var bodyParser = require('body-parser');
var genfun = require('generate-function');

var app = Express();

app.use(bodyParser.json());

app.use(function getAuth0Config (req, res, done) {
  //TODO: switch to req.webtaskContext.secrets when available
  var secrets = req.webtaskContext.data;

  // load auth0 config object with secret values
  req.auth0 = {
    client_id: secrets.client_id,
    client_secret: secrets.client_secret,
    domain: secrets.domain,
    admin_authz: secrets.admin_authz,
    api_access_token: secrets.api_access_token
  };

  // assert that all values were populated
  var missingKeys = Object.keys(req.auth0).reduce(function (previous, key) {
    var secret = req.auth0[key];
    if (secret === undefined)
      previous.push(key);
    return previous;
  }, []);
  if (missingKeys.length > 0)
    return done(new Error('Missing secrets: ' + missingKeys));

  done();
});

// authenticate
app.use(jwt({
  secret: function(req, payload, done) {
    done(null, new Buffer(req.auth0.client_secret, 'base64'));
  }
}));

// authorize
app.use(function authorize (req, res, done) {
  var issuer = 'https://' + req.auth0.domain + '/';

  if (req.user.iss !== issuer)
    return res.status(401).send('Untrusted issuer');
  if (req.user.aud !== req.auth0.client_id)
    return res.status(401).send('Incorrect audience');

  var authorizer = genfun()
    (req.auth0.admin_authz)
    .toFunction();

  if (!authorizer(req.user))
    return res.status(401).send('User unauthorized');

  done();
});

// endpoints

function apiReverseProxy (req, res, next) {
  var opts = {
    method: req.method,
    uri: 'https://' + req.auth0.domain + '/api/v2' + req.path,
    qs: _.omit(req.query, 'webtask_no_cache'),
    auth: { bearer: req.auth0.api_access_token },
    json: Object.keys(req.body).length > 0 ? req.body : null
  };

  request(opts)
    .on('request', function (request) {
      var loggedRequest = {
        method: request.method,
        path: request.path,
        headers: _.clone(request._headers)
      };
      loggedRequest.headers.authorization = 'Bearer XXX';

      console.log('Auth0 API Call:', {
        by_user: req.user.sub,
        request: loggedRequest
      });
    })
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(res);
}

app.get('/users', apiReverseProxy);
app.post('/users', apiReverseProxy);
app.get('/users/:id', apiReverseProxy);
app.del('/users/:id', apiReverseProxy);
app.patch('/users/:id', apiReverseProxy);

// errors

app.use(function errorHandler (err, req, res, next) {
  if (err.message && err.status && err.status < 500) {
    // client errors
    res.status(err.status).send(err.message);
  } else {
    // server errors
    console.log(err.stack ? err.stack : err);

    res.status(500).send('Something borked!');
  }
});

module.exports = Webtask.fromExpress(app);
