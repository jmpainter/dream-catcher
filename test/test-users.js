const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

mongoose.Promise = global.Promise;

const {Dream} = require('../dreams/models');
const {User} = require('../users/models');
const {Comment} = require('../comments/models');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const {
  seedData,
  generateDreamData,
  generateCommentData,
  generateTestUserToken,
  tearDownDb,
  handleError
} = require('./seeds.js');

//save off two users for authenticated tests
let testUser = {};
let testUser2 = {};
let testUserToken;
let testUser2Token;

//save off a dream for comment tests
let testDream = {};

chai.use(chaiHttp);
chai.use(require('chai-datetime'));

function seedDataAndGenerateTestUsers() {
  return seedData()
    .then(() => User.findOne())
    .then(user => {
      testUser = user;
      testUserToken = generateTestUserToken(user);
      return User.findOne({_id: {$ne: user.id}});
    })
    .then(user2 => {
      testUser2 = user2;
      testUser2Token = generateTestUserToken(user2);
      return Dream.findOne();
    })
    .then(dream => {
      testDream = dream;
    })
    .catch(err => console.error(err));
}

describe('users API resource', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const screenName = 'Name';

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(function() {
    return seedDataAndGenerateTestUsers();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });  

  describe('POST /users', function() {

    it('Should reject users with missing usernname', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          password,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing Field');
          expect(res.body.location).to.equal('username');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a missing password', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing Field');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a non-string username', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username: {value: 'value'},
          password,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('incorrect field type: expected string');
          expect(res.body.location).to.equal('username');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a non-string password', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password: 123,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('incorrect field type: expected string');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a non-string first name', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password,
          firstName: {value: 'value'},
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('incorrect field type: expected string');
          expect(res.body.location).to.equal('firstName');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a non-string last name', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password,
          firstName,
          lastName: 1234,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('incorrect field type: expected string');
          expect(res.body.location).to.equal('lastName');
        });
    });

    it('Should reject users with a non-string screen name', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password,
          firstName,
          lastName,
          screenName: {value: 'value'}
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError')
          expect(res.body.message).to.equal('incorrect field type: expected string');
          expect(res.body.location).to.equal('screenName');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a non-trimmed user name', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username: '  john@gmail.com ',
          password,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('can not begin or end with whitespace');
          expect(res.body.location).to.equal('username');
        })
        .catch(err => handleError(err));
    });

    it('Should reject usesrs with a non-trimmed password', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password: 'password  ',
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('can not begin or end with whitespace');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with an empty username', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username: '',
          password,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('must be at least 1 characters long');
          expect(res.body.location).to.equal('username');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a password less than 7 characters', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password: '123456',
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('must be at least 7 characters long');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });

    it('Should reject users with a password greater than 72 characters', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password: new Array(73).fill('a').join(''),
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('must be at most 72 characters long');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });
    
    it('Should reject a request with a duplicate username', function() {
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password,
          firstName,
          lastName,
          screenName
        })
        .then(() => {
          return chai
          .request(app)
          .post('/users')
          .send({
            username,
            password,
            firstName,
            lastName,
            screenName
          })
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('sorry, that username is already taken');
        })
        .catch(err => handleError(err));
    });

    it('Should create a new user', function() {
      let user;
      return chai
        .request(app)
        .post('/users')
        .send({
          username,
          password,
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body.username).to.equal(username);
          expect(res.body.firstName).to.equal(firstName);
          expect(res.body.lastName).to.equal(lastName);
          expect(res.body.screenName).to.equal(screenName);
          user = res.body;
          return User.findById(user.id)
        })
        .then(_user => {
          expect(_user).to.not.be.null;
          expect(_user.id).to.equal(user.id);
          expect(_user.firstName).to.equal(user.firstName);
          expect(_user.lastName).to.equal(user.lastName);
          expect(_user.username).to.equal(user.username);
          expect(_user.screenName).to.equal(user.screenName);
          return _user.validatePassword(password);
        })
        .then(passwordIsCorrect => {
          expect(passwordIsCorrect).to.be.true;
        })
        .catch(err => handleError(err));
    })
  });

  describe('GET /users', function() {

    it('Should not allow an unregistered user to get user information', function() {
      return chai.request(app)
        .get('/users')
        .then(res => {
          expect(res).to.have.status(401);
        })
        .catch(err => handleError(err));
    });

    it('Should allow a registered user to get their information', function() {
      return chai.request(app)
        .get('/users')
        .set('authorization', `Bearer ${testUserToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.equal(testUser.id);
          expect(res.body.username).to.equal(testUser.username);
          expect(res.body.firstName).to.equal(testUser.firstName);
          expect(res.body.lastName).to.equal(testUser.lastName);
          expect(res.body.screenName).to.equal(testUser.screenName);
        })
        .catch(err => handleError(err));
    });

  });
});