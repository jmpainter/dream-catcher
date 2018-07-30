const express = require('express');
const router  = express.Router({mergeParams: true});

const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const mongoose = require('mongoose');

const { Comment } = require('./models');
const { Dream } = require('../dreams/models');

const jwtAuth = passport.authenticate('jwt', {session: false});

mongoose.Promise = global.Promise;

//nested route for comment creation for a dream
router.post('/', jsonParser, jwtAuth, (req, res) => {

  if(!('text' in req.body)) {
    const message = `Missing 'text' in req.body`
    console.error(message);
    return res.status(400).send(message);
  }

  let dream = null;
  let comment = null;
  Dream
    .findById(req.params.id)
    .then(_dream => {
      if(!_dream) {
        return Promise.reject({
          code: 404,
          reason: 'AccessError',
          message: 'Dream was not found'
        });
      } else if (_dream.commentsOn === false) {
        return Promise.reject({
          code: 401,
          reason: 'AccessError',
          message: 'Dream is not open for comments'
        });
      } else {
        dream = _dream;
        return Comment
          .create({
            dream: req.params.id,
            author: req.user.id,
            text: req.body.text
          });
      }
    })
    .then(_comment => {
      comment = _comment;
      dream.comments.push(_comment._id);
      return dream.save();
    }) 
    .then(() => {
      return res.status(201).json(comment.serialize());
    })
    .catch(err => {
      console.log(err);
      if(err.reason === 'AccessError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: 'Internal Server Error'});
    });
});

router.delete('/:comment_id', jsonParser, jwtAuth, (req, res) => {
  // Make sure that comment to delete is actually one of the user's or is on the user's dream
  // When comment is deleted, the reference in the user's dream is deleted also
  let dream;

  Dream
    .findById(req.params.id)
    .then(_dream => {
      dream = _dream;
      if(!dream) {
        return Promise.reject({
          code: 404,
          reason: 'AccessError',
          message: 'Dream was not found'
        });
      } else {
        return Comment
          .findById(req.params.comment_id);
      }
    })
    .then(comment => {
      if(!comment) {
        return Promise.reject({
          code: 404,
          reason: 'AccessError',
          message: 'Comment was not found'
        });
      } else if(comment.author.toString() === req.user.id || dream.author.toString() === req.user.id) {
        return comment.remove();
      } else {
        return Promise.reject({
          code: 401,
          reason: 'AccessError',
          message: 'Not authorized to delete comment'
        });      
      }
    })
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      if (err.reason === 'AccessError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: JSON.stringify(err)});
    });
})

module.exports = {router};
