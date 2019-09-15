(function () {
  'use strict';

  var express = require('express');
  var session = require('express-session');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var compression = require('compression');
  var path = require('path');
  var passport = require('passport');
  var User = require('./user');
  var ExampleStrategy = require('./passport-example/strategy').Strategy;
  var app = express();
  var server;
  var port = process.argv[2] || 3002;
  var oauthConfig = require('./oauth-config');
  var pConf = oauthConfig.provider;
  var lConf = oauthConfig.consumer;
  var opts = require('./oauth-consumer-config');

  console.log('>>> pConf:', pConf);
  console.log('>>> lConf:', lConf);
  
  // if (!connect.router) {
  //   connect.router = require('connect_router');
  // }

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Facebook profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    //Users.create(user);
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    var user = obj; // Users.read(obj);
    done(null, user);
  });

  passport.use(new ExampleStrategy({
      // see https://github.com/jaredhanson/oauth2orize/blob/master/examples/all-grants/db/clients.js
      clientID: opts.clientId,
      clientSecret: opts.clientSecret,
      callbackURL: lConf.protocol + "://" + lConf.host + "/auth/example-oauth2orize/callback"
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({ profile: profile }, function (err, user) {
        user.accessToken = accessToken;
        return done(err, user);
      });
    }
  ));

  function route(router) {
    
    router.get('/', function(req, res) {
      res.statusCode = 302;
      res.setHeader('Location', '/auth/example-oauth2orize');
      res.end('');
    });
    
    router.get('/about', function (req, res) {
      res.send('About oauth2orize consumer/client');
    })
    
    router.get('/externalapi/account', function (req, res, next) {
      console.log('[using accessToken]', req.user.accessToken);
      if (false) { next(); }
      var request = require('request')
      var options = {
        url: pConf.protocol + '://' + pConf.host + '/api/userinfo', 
        headers: {
          'Authorization': 'Bearer ' + req.user.accessToken
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          res.end(body);
        } else {
          res.end('error: \n' + body);
        }
      }
      request(options, callback);
    });
    
    router.get(
      '/auth/example-oauth2orize', 
      passport.authenticate('exampleauth', { scope: ['email'] }));
    
    router.get('/auth/example-oauth2orize/callback',
      //passport.authenticate('facebook', { successRedirect: '/close.html?accessToken=blar',
      //                                    failureRedirect: '/close.html?error=foo' }));
      passport.authenticate('exampleauth', { failureRedirect: '/close.html?error=foo' })
    );
    
    router.get('/auth/example-oauth2orize/callback', 
      function (req, res) {
        console.log('req.session');
        console.log(req.session);
        var url = '/success.html';
        /*
        + '&accessToken=' + req.session.passport.user.accessToken
        + '&email=' + req.session.passport.user.profile.email
        + '&link=' + req.session.passport.user.profile.profileUrl
        */
        console.log(url);
        res.statusCode = 302;
        res.setHeader('Location', url);
        res.end('hello');
        // This will pass through to the static module
        //req.url = url;
        //next();
      }
    );
    
    router.post('/auth/example-oauth2orize/callback', function (req, res) {
      console.log('req.user', req.user);
      res.end('thanks for playing');
    });
    
    router.get('/success.html', function(req, res) {
      res.end(
        '<html><body>' + 
        'sso login is success<br/><br/>' + 
        '<a href="/externalapi/account">user info</a>' + 
        '</body></html>');
    });
  }

  app
    .use(express.query())
    .use(express.json())
    .use(express.urlencoded())
    .use(compression())
    .use(cookieParser())
    .use(bodyParser.json())
    .use(session({ secret: 'keyboard mouse' }))
    .use(passport.initialize())
    .use(passport.session())
    .use(express.static(path.join(__dirname, 'public')));
  route(app);

  module.exports = app;

  if (require.main === module) {
    server = app.listen(port, function () {
      console.log('Listening on', server.address());
    });
  }
}());
