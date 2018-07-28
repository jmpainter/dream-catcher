const express = require('express');
const router  = express.Router({mergeParams: true});

const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const mongoose = require('mongoose');

const { Comment } = require('./models');
const { Dream } = require('../dreams/models');
const { User } = require('../users/models');

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
  console.log('FROM ROUTER: ' + req.params.id);
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
            text: req.body.text,
            author: req.user.id
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
  // Make sure that comment to delete is actually one of the user's comments 
  Comment
    .findById(req.comment_id)
    .then(comment => {
      if(!comment) {
        return Promise.reject({
          code: 404,
          reason: 'AccessError',
          message: 'Comment does not exist'
        });
      } else if(comment.author.toString() !== req.user.id) {
        return Promise.reject({
          code: 401,
          reason: 'AccessError',
          message: 'Not authorized to delete comment'
        });      
      } else {
        return Comment.findByIdAndRemove(req.params.id)
      }
    })
    .then(() => {
      return Dream.findById(req.params.id);
    })
    .then(dream => {
      //delete comment from ebedded dreams's list of comments
      const dreamIndex = dream.comments.indexOf(mongoose.Types.ObjectId(req.params.id));
      user.dreams.splice(dreamIndex, 1);
      return user.save();
    })
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      if (err.reason === 'AccessError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: 'Internal Server Error'});
    });
})

module.exports = {router};
