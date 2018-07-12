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

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()

const { Dream } = require('./models');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

router.get('/public-dreams', (req, res) => {
  Dream
    .find({public: true})
    .populate('author', 'firstName lastName screenName')
    .then(dreams => {
      console.log(dreams);
      res.json({
        dreams: dreams
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'});
    })
});

// router.get('/', jwtAuth, (req, res) => {
//   return res.json({
//     data: 'rosebud'
//   });
// })

module.exports = {router};