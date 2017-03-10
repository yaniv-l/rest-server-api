const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define  model
const userSchema = new Schema({
  email: {type: String, unique: true, lowercase: true},
  password: String
});

// On save hook - encrypt password
// Befor saving a model, run this function
userSchema.pre('save', function(next) {
  // Get access to the current user model
  const user = this;

  // Generate a salt and then run a callback
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }

    // hash (encrypt) password using generated salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }

      // overwite the plain text password with the hased password
      user.password = hash;
      // call next - which is the model save, to save model into mongodb
      next();
    });

  });
});

// Add method to the user model - any function added under the userSchem.methods
// will be exposed as part of the userSchema object
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  // bcrypt.compare will hash the candidatePassword using the salt inside
  // this.passport and will than compare the hashes, once done will call
  // function with isMatch true/false acourding to the comparison
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }

    callback(null, isMatch);
  });
};

// Create the model class - this will load the model into mongo
// i.e will create a collection named 'users' with the schema of userSchema
const ModelClass = mongoose.model('users', userSchema);

// Export the model
module.exports = ModelClass;
