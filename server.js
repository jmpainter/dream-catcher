const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const AnonymousStrategy = require('passport-anonymous').Strategy;

const { router: dreamsRouter } = require('./dreams');
const { router: usersRouter } = require('./users');
const { router: commentsRouter } = require('./comments');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const app = express();
app.use(express.static('public'));
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

const { PORT, DATABASE_URL } = require('./config');

passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(new AnonymousStrategy());

let server;

function logErrors(err, req, res, next) {
  console.error(err);
  return res.status(500).json({message: 'Internal Server Error'});
}

app.use(logErrors);

app.use('/dreams', dreamsRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/dreams/:id/comments', commentsRouter);

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true},  err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };