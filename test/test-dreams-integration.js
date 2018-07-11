const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const ObjectID = require('mongodb').ObjectId;

const mongoose = require('mongoose');

const expect = chai.expect;

const {Dream} = require('../dreams');
const {User} = require('../users');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

//first create users collection in order to give each dream an author

const newUserIds = [];

function seedUserData() {
  console.info('seeding user data');
  const seedData = [];

  for (let i = 1; i <= 3; i++) {
    seedData.push(generateUserData());
  }
  // this will return a promise
  return User.insertMany(seedData);
}

function generateUserData() {
  const userId = new ObjectID();
  newUserIds.push(userId);
  return {
    _id: userId,
    username: faker.internet.userName(),
    password: faker.internet.password(),
    screenName: faker.name.firstName(),
    firstName: faker.name.lastName(),
    lastName: faker.name.lastName()
  }
}

//create 3 dreams for each new user

function seedDreamData() {
  console.info('seeding dream data');
  const seedData = [];

  for(let id of newUserIds) {
    for(let i = 0; i <= 3; i++) {
      seedData.push(generateDreamData(id));
    }
  }
  return Dream.insertMany(seedData);
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

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('dreams API resource', function() {
  
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(function() {
    return Promise.all([seedUserData(), seedDreamData()]);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });  

  describe('GET endpoint', function() {

    it('should return all public dreams', function() {
      let res;
      return chai.request(app)
        .get('/dreams')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.dreams).to.have.lengthOf.at.least(1);
          return Dream.count();
        })
        .then(function(count) {
          expect(res.body.dreams).to.have.lengthOf(count);
        });      
    });
  });
});