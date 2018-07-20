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
    console.err(err);
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
  });
});