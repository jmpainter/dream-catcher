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


//This endpoint allows an unauthenticated user to get public dreams
//or an authenticated user to get public dream or their personal dream list
router.get('/', passport.authenticate(['jwt', 'anonymous'], { session: false }), (req, res) => {
  if (req.user && req.query.personal === "true") {
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
  } else {
    const perPage = 10;
    const page = req.params.page || 1;
    let count = 0;
  
    Dream
      .countDocuments({public: true})
      .then(_count => {
        count = _count;
        return Dream
          .find({public: true})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('author', 'firstName lastName screenName');
      })
      .then(dreams => {
        res.json({
          dreams: dreams,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      })
  }
});

router.post('/', jwtAuth, (req, res) => {
  const requiredFields = ['title', 'text'];

  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!field in req.body) {
      const message = `Missing '${field}' in req.body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Dream
    .create({
      title: req.body.title,
      author: req.user.id,
      text: req.body.text
    })
    .then(dream => res.status(201).json(dream.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error'});
    });
});

module.exports = {router};