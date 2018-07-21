const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function handleError(err) {
  if (err instanceof chai.AssertionError) {
    throw err;
  } else {
    console.error(err);
  }  
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

  after(function() {
    return closeServer();
  });

  beforeEach(function() { });

  afterEach(function() {
    return User.remove({});
  });

  describe('POST', function() {

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
          expect(res.body.message).to.equal('Incorrect field type: expected string');
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
          expect(res.body.message).to.equal('Incorrect field type: expected string');
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
          username
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
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
          expect(res.body.message).to.equal('Incorrect field type: expected string');
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
          expect(res.body.message).to.equal('Incorrect field type: expected string');
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
          expect(res.body.message).to.equal('Can not begin or end with whitespace');
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
          expect(res.body.message).to.equal('Can not begin or end with whitespace');
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
          expect(res.body.message).to.equal('Must be at least 1 characters long');
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
          password: 'pass',
          firstName,
          lastName,
          screenName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Must be at least 7 characters long');
          expect(res.body.location).to.equal('password');
        })
        .catch(err => handleError(err));
    });    

  });
});