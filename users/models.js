const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {type: String, required: true},
  screenName: {type: String, default: ''},
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  dreams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dream"
    }
  ]
});

userSchema.methods.serialize = function() {
  return {
    username: this.username,
    screenName: this.screenName || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', userSchema);

module.exports = { User };
