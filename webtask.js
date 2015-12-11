var jwt = require('express-jwt');
var Express = require('express');
var Webtask = require('webtask-tools');
var _ = require('lodash');

var app = Express();

app.use(function getAuth0Config (req, res, done) {
  //TODO: switch to req.webtaskContext.secrets when available
  var secrets = req.webtaskContext.data;

  // load auth0 config object with secret values
  req.auth0 = {
    client_id: secrets.client_id,
    client_secret: secrets.client_secret,
    domain: secrets.domain,
    authz_claims: secrets.authz_claims
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

  var authorizer = _.matches(JSON.parse(req.auth0.authz_claims));
  if (!authorizer(req.user))
    return res.status(401).send('User unauthorized');

  done();
});

// endpoints

app.get('/users', function (req, res) {
  res.status(200).json({ foo: 'bar' });
});

module.exports = Webtask.fromExpress(app);
