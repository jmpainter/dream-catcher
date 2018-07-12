  // route
  // /dreams

  // endpoints
  // get: public
  // get by userid: protected
  // put: protected
  // post: protected
  // delete: protected

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const mongoose = require('mongoose');

const { Dream } = require('./models');
const { User } = require('../users');

const jwtAuth = passport.authenticate('jwt', {session: false});

mongoose.Promise = global.Promise;

router.get('/public', (req, res) => {
  Dream
    .find({public: true})
    .populate('author', 'firstName lastName screenName')
    .then(dreams => {
      res.json({
        dreams: dreams
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'});
    })
});

router.get('/', jwtAuth, (req, res) => {
  User
    .findById(req.user.id)
    .populate('dreams', 'title text publishDate public')
    .then(user => {
      res.json({
        dreams: user.dreams
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'});
    })
});

module.exports = {router};