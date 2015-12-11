var jwt = require('express-jwt');
var Express = require('express');
var Webtask = require('webtask-tools');

var app = Express();

// endpoints

app.get('/users', function (req, res) {
  res.status(200).json({ foo: 'bar' });
});

module.exports = Webtask.fromExpress(app);
