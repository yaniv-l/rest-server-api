const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStartegy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

// Setup options for locacl strategy
const localOptions = { usernameField: 'email', passwordField: 'password' };

// Create local startegy
// Verify this email and passowrd are correct
// call done with the user if correct
// otherwsie call done with false
const localLogin = new LocalStrategy(localOptions,
  function(email, password, done) {
    // checking we have a user with this email
    User.findOne({ email: email }, function(err, user) {
      // We had an error - returning early
      if (err) { return done(err); }
      // We could not find a user with this email
      if (!user) { return done(null, false); }

      // Compare password - is 'password'equal to user.password?
      user.comparePassword(password, function(err, isMatch) {
        // We got an error
        if (err) { return done(err); }
        // The user password did not match
        if (!isMatch) { return done(null, false); }

        // User password matched - calling 'done' with user
        // When calling 'done' with user (which is a userSchema), passport adds
        // the user object into the request object, i.e req.user, so we can have
        // and use the user object later on by accessing req.user
        return done(null, user);
    });
  });
});

// Setup our options for JWT startegy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT startegy
const jwtLogin = new JwtStartegy(jwtOptions, function(payload, done) {
  // See if the user.id in the payload exists in our database
  // if yes, call the 'done' callback with that user
  // if not, call the 'done' callback without a user object
    User.findById(payload.sub, function(err, user) {
      if (err) {return done(err, false)};

      if (user) {
        // When calling 'done' with user (which is a userSchema), passport adds
        // the user object into the request object, i.e req.user, so we can have
        // and use the user object later on by accessing req.user
        done(null, user);
      }
      else {
        done(null, false);
      }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
