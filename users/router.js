const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const { User } = require('./models');
const jsonParser = bodyParser.json();

mongoose.Promise = global.Promise;

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'screenName', 'firstName', 'lastName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if(missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing Field',
      location: missingField
    });
  }

  const stringFields = ['username', 'screenName', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if(nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonExplicitlyTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if(nonExplicitlyTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'can not begin or end with whitespace',
      location: nonExplicitlyTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1,
      max: 50
    },
    password: {
      min: 7,
      max: 72
    },
    screenName: {
      max: 10
    },
    firstName: {
      max: 15
    },
    lastName: {
      max: 20
    }
  }
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
     'min' in sizedFields[field] &&
        req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field => 
      'max' in sizedFields[field] &&
        req.body[field].trim().length > sizedFields[field].max
  );

  if(tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField 
        ? `must be at least ${sizedFields[tooSmallField].min} characters long`
        : `must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, screenName = '', firstName = '', lastName = '' } = req.body;

  firstName = firstName.trim();
  lastName = lastName.trim();
  screenName = screenName.trim();

  return User.find({username})
    .countDocuments()
    .then(count => {
      if(count > 0) {
        // existing user with same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'sorry, that username is already taken'
        });
      }
      // no existing user with this username
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        screenName,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: 'Internal Server Error'});
    });
});

router.get('/:id', jwtAuth, (req, res) => {
  if(req.params.id !== req.user.id) {
    return res.status(401).json({message: 'Unauthorized'});
  } else {
    User.findById(req.params.id)
      .then(user => {
        if(!user) {
          return res.status(404).json({message: 'Not found'});
        } else {
          return res.status(200).json(user.serialize());
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'})
      });
  }
})

module.exports = {router};
