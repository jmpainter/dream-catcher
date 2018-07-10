// const express = require('express');
// const bodyParser = require('body-parser');

// const { User } = require('./models');

// const router = express.Router();

// const jsonParser = bodyParser.json();

// router.post('/', jsonParser, (req, res) => {
//   const requiredFields = ['username', 'password'];
//   const missingField = requiredFields.find(field => !(field in req.body));

//   if(missingField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Missing field',
//       location: missingField
//     });
//   }

//   const stringFields = ['username', 'screenName', 'password', 'firstName'];
//   const nonStringField = stringFields.find(
//     field => field in req.body && typeof req.body[field] !== 'string'
//   );

//   if(nonStringField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Incorrect field type: expected string',
//       location: nonStringField
//     });
//   }

//   const sizedFields = {
//     username: {
//       min: 1
//     },
//     password: { 
//   }
// });