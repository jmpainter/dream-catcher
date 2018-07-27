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
//or an authenticated user to get public dreams or their personal dream list
router.get('/', passport.authenticate(['jwt', 'anonymous'], { session: false }), (req, res) => {
  if(!req.user && req.query.personal === "true") {
    return res.status(401).json({message: 'Unauthorized'});
  }
  
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
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      })
  } else {
    const perPage = 16;
    const page = req.params.page || 1;
    let count = 0;
  
    Dream
      .countDocuments({public: true})
      .then(_count => {
        count = _count;
        return Dream
          .find({public: true})
          .sort('-publishDate')
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

router.post('/', jsonParser, jwtAuth, (req, res) => {
  const requiredFields = ['title', 'text'];

  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing '${field}' in req.body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  let dream = null;

  Dream
    .create({
      title: req.body.title,
      author: req.user.id,
      text: req.body.text
    })
    .then(_dream => {
      dream = _dream;
      return User.findById(req.user.id)
    })
    .then(user => {
      //add dream reference to user dreams array
      user.dreams.push(dream._id);
      return user.save();
    })
    .then(user => {
      if(user) res.status(201).json(dream.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error'});
    });
});

router.put('/:id', jsonParser, jwtAuth, (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'text', 'publishDate', 'public'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  // Make sure that dream to update is actually one of the user's dreams 
  Dream
    .findById(req.params.id)
    .then(dream => {
      if(dream.author.toString() !== req.user.id) {
        return res.status(401).json({message: 'Unauthorized'});
      } else {
        return Dream.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {'new': true})
      }
    })
    .then(dream => {
      if(dream) res.status(200).json(dream.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/:id', jwtAuth, (req, res) => {
  // Make sure that dream to delete is actually one of the user's dreams 
  Dream
  .findById(req.params.id)
  .then(dream => {
    if(!dream) {
      res.status(404).json({message: 'Not Found'});
      throw new Error('abort promise chain');
    } else if(dream.author.toString() !== req.user.id) {
      res.status(401).json({message: 'Unauthorized'});
      throw new Error('abort promise chain');
    } else {
      return Dream.findByIdAndRemove(req.params.id)
    }
  })
  .then(dream => {
    if(dream) {
      return User.findById(req.user.id);
    }
  })
  .then(user => {
    //delete dream from ebedded user's list of dreams
    const dreamIndex = user.dreams.indexOf(mongoose.Types.ObjectId(req.params.id));
    user.dreams.splice(dreamIndex, 1);
    return user.save();
  })
  .then(user => {
    if(user) res.status(204).end();
  })
  .catch(err => {
    if(err.message !== 'abort promise chain') {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    }
  });
})

module.exports = {router};