var jwt = require('express-jwt');
var Express = require('express');
var Webtask = require('webtask-tools');

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

// endpoints

app.get('/users', function (req, res) {
  res.status(200).json({ foo: 'bar' });
});

module.exports = Webtask.fromExpress(app);
