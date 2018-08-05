const faker = require('faker');
const chai = require('chai');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const { Dream } = require('../dreams/models');
const { User } = require('../users/models');

mongoose.Promise = global.Promise;

function seedData() {
  console.info('seeding data');
  const userSeedData = [];
  //create data for three new users
  for (let i = 1; i <= 3; i++) {
    userSeedData.push(generateUserData());
  }
  const promises = [];
  //each user is created with password 'test'
  userSeedData.forEach((seed, index) => {
    promises.push(
      User.hashPassword(seed.password).
      then(password => {
        seed["password"] = password;
        return User.create(seed);
      })
      .then(user => {
        const dreamPromises = [];
        //create three dreams for each user
        for (let i = 1; i <= 3; i++) {
          dreamPromises.push(Dream.create(generateDreamData(user._id)))
        }
        return Promise.all(dreamPromises);
      })
      .then(results => {
        // add each dream id to dream array in user document
        const addDreamToUserPromises = [];
        results.forEach((dream, index) => {
          addDreamToUserPromises.push(addDreamToUser(dream.author, dream._id));
        })
        return Promise.all(addDreamToUserPromises);
      })
      .catch(err => handleError(err))
    )
  });
  return Promise.all(promises);
}

function addDreamToUser(userId, dreamId) {
  return User.findById(userId)
    .then(user => {
      user.dreams.push(dreamId);
      return user.save();
    })
    .catch(err => handleError(err));
}

function generateUserData() {
  return {
    username: faker.internet.userName(),
    screenName: faker.name.firstName(),
    firstName: faker.name.lastName(),
    lastName: faker.name.lastName(),
    password: 'password'
  }
}

function generateDreamData(userId) {
  return {
    title: faker.lorem.sentence(),
    author: userId,
    text: faker.lorem.paragraphs(),
    publishDate: faker.date.past(),
    public: true
  }
}

function generateCommentData(userId, dreamId) {
  return {
    author: userId,
    dream: dreamId,
    text: faker.lorem.paragraphs(),
    publishDate: faker.date.past()
  }
}

function generateTestUserToken(user) {
  return jwt.sign(
    {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: user.username,
      expiresIn: '7d'
    }
  );
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

function handleError(err) {
  if (err instanceof chai.AssertionError) {
    throw err;
  } else {
    console.error(err);
  }  
}

module.exports = {
  seedData,
  generateUserData,
  generateDreamData,
  generateCommentData,
  generateTestUserToken,
  tearDownDb,
  handleError
}



