const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const ObjectID = require('mongodb').ObjectId;

const mongoose = require('mongoose');

const expect = chai.expect;

mongoose.Promise = global.Promise;

const {Dream} = require('../dreams');
const {User} = require('../users');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);
chai.use(require('chai-datetime'));

//first create users collection in order to give each dream an author

function seedData() {
  console.info('seeding data');

  const userSeedData = [];
  
  //create three users
  for (let i = 1; i <= 3; i++) {
    userSeedData.push(generateUserData());
  }
  
  const promises = [];

  userSeedData.forEach(seed => {
    promises.push(
      User.create(seed)
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
          results.forEach(result => {
            addDreamToUserPromises.push(addDreamToUser(result.author, result._id));
          })
          return Promise.all(addDreamToUserPromises);
        })
    )
  });

  return Promise.all(promises);
}

function addDreamToUser(userId, dreamId) {
  return User.findById(userId)
    .then(user => {
      user.dreams.push(dreamId);
      user.save()
    })
}

function generateUserData() {
  return {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    screenName: faker.name.firstName(),
    firstName: faker.name.lastName(),
    lastName: faker.name.lastName()
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

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('dreams API resource', function() {
  
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(function() {
    return seedData();
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

    it('should return dreams with the right fields', function() {
      let resDream;
      return chai.request(app)
        .get('/dreams')
        .then(function(res) {
          // so subsequent .then blocks can access response object
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.dreams).to.have.lengthOf.at.least(1);

          res.body.dreams.forEach(function(dream) {
            expect(dream).to.be.a('object');
            expect(dream).to.include.keys('_id', 'title', 'author', 'text', 'publishDate');
          });
          resDream = res.body.dreams[0];          
          return Dream.findById(resDream._id)
            .populate('author', 'firstName lastName screenName');
        })
        .then(function(dream) {
          expect(resDream._id).to.equal(dream.id);
          expect(resDream.title).to.equal(dream.title);
          expect(resDream.author.firstName).to.equal(dream.author.firstName);
          expect(resDream.author.lastName).to.equal(dream.author.lastName);
          expect(resDream.author.screenName).to.equal(dream.author.screenName);
          expect(resDream.text).to.equal(dream.text);
          expect(new Date(resDream.publishDate)).to.equalDate(new Date(dream.publishDate));
        });
    });    

  });
});