const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has already had thier email and password auth'd (using the
  // 'requireAuth' middelware in the router), we now just need  to issue them
  // with a token
  res.send({ success: true, token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Check the both email and passsowrd has been provided, else return early
  if (!email || !password) {
    return res.status(422).send({ success: false,
      error: 'Must provide email and password'});
  }

  // Check if user already exists
  User.findOne({email: email}, function(err, existingUser) {
    // If an error ocoured while trying to findOne
    if (err) { return next(err); }

    // if user already exists, then throw an Error
    if (existingUser) {
      return res.status(402).send({ success: false,
        error: 'Email is already in use'});
    }

    // if user does not exists, then craete a new record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      // if fails to insert into db
      if(err) { return next(err); }

      // send back a success indications
      res.json({ success: true, token: tokenForUser(user) });
    })


  });
}
