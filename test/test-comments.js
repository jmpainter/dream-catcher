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

describe('dreams API resource', function() {
  
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

  describe('POST :id/comments endpoint', function() {
    it('Should not allow an unauthorized user to post a comment', function() {

      return chai.request(app)
        .post(`/dreams/${testDream.id}/comments`)
      .then(function (res) {
        expect(res).to.have.status(401);
      })
      .catch(err => handleError(err));
    });

    it("Should return an error if a dream does not exist", function() {
      const newComment = generateCommentData(testUser.id, testDream.id);

      return chai.request(app)
      //send fake objectid as parameter
        .post(`/dreams/${new Array(24).fill(0).join('')}/comments`)
        .set('authorization', `Bearer ${testUserToken}`)
        .send(newComment)
        .then(function(res) {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });

    it("Should not add a comment with incorrect fields", function() {
      return chai.request(app)
        .post(`/dreams/${testDream.id}/comments`)
        .set('authorization', `Bearer ${testUserToken}`)
        .send({fake: 'fake'})
      .then(function(res) {
        expect(res).to.have.status(400);
      })
      .catch(err => handleError(err));
    });

    it("Should not add a comment if the dream is not public", function() {
      const newComment = generateCommentData(testUser.id, testDream.id);

      return chai.request(app)
        .post(`/dreams/${testDream.id}/comments`)
        .set('authorization', `Bearer ${testUserToken}`)
        .send(newComment)         
        .then(function(res) {
          expect(res).to.have.status(401);
        })
        .catch(err => handleError(err));
    });
    
    it("Should add a comment if the dream has comments turned on", function() {
      const newComment = generateCommentData(testUser.id);
      
      return Dream.findByIdAndUpdate(testDream.id, {$set: {commentsOn: true, author: testUser.id}})
        .then(function() {
          return chai.request(app)
            .post(`/dreams/${testDream.id}/comments`)
            .set('authorization', `Bearer ${testUserToken}`)
            .send(newComment)         
        })
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.include.keys('id', 'text', 'author', 'publishDate');
          expect(res.body.id).to.not.be.null;
          expect(res.body.text).to.equal(newComment.text);
          expect(res.body.author).to.equal(newComment.author);

          return Comment.findById(res.body.id)
        })
        .then(function(comment) {
          expect(comment.author.toString()).to.equal(newComment.author);
          expect(comment.text).to.equal(newComment.text);
        })
        .catch(err => handleError(err));
    });
  });

  describe('/dreams/:id/comments/:comment_id DELETE endpoint', function() {

    it('Should return 404 for a dream that could not be found', function() {
      return chai.request(app)
        .delete(`/dreams/${new Array(12).fill(0).join('')}/comments/${new Array(12).fill(0).join('')}`)
        .set('authorization', `Bearer ${testUserToken}`)
        .then(function(res) {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });

    it('Should return 404 for a comment that could not be found', function() {
      return chai.request(app)
        .delete(`/dreams/${testDream.id}/comments/${new Array(12).fill(0).join('')}`)
        .set('authorization', `Bearer ${testUserToken}`)
        .then(function(res) {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });    

    it('Should not allow a user to delete a comment that is not theirs on a dream that is not theirs', function() {
        const newComment = generateCommentData(testUser2.id, testDream.id);

        return Dream.findByIdAndUpdate(testDream.id, {$set: {commentsOn: true, author: testUser2.id}})
          .then(function() {
            return chai.request(app)
              .post(`/dreams/${testDream.id}/comments`)
              .set('authorization', `Bearer ${testUser2Token}`)
              .send(newComment)
          })
          .then(res => {
            expect(res).to.have.status(201);
            return chai.request(app)
              .delete(`/dreams/${testDream.id}/comments/${res.body.id}`)
              .set('authorization', `Bearer ${testUserToken}`)
          })
          .then(res => {
            expect(res).to.have.status(401);
          })
          .catch(err => handleError(err));        
    });

    it('Should allow a user to delete a comment that belongs to the user', function() {
      const newComment = generateCommentData(testUser.id);
      
      return Dream.findByIdAndUpdate(testDream.id, {$set: {commentsOn: true}})
        .then(function() {
          return chai.request(app)
            .post(`/dreams/${testDream.id}/comments`)
            .set('authorization', `Bearer ${testUserToken}`)
            .send(newComment)         
        })
        .then(res => {
          expect(res).to.have.status(201);
          return chai.request(app)
            .delete(`/dreams/${testDream.id}/comments/${res.body.id}`)
            .set('authorization', `Bearer ${testUserToken}`)
        })
        .then(res => {
          expect(res).to.have.status(204)
        })
        .catch(err => handleError(err));        
    })

    it('Should allow a user to delete a comment that is not theirs on a dream that is theirs', function() {
      const newComment = generateCommentData(testUser2.id, testDream.id);

      return Dream.findByIdAndUpdate(testDream.id, {$set: {commentsOn: true, author: testUser.id}})
        .then(function() {
          return chai.request(app)
            .post(`/dreams/${testDream.id}/comments`)
            .set('authorization', `Bearer ${testUser2Token}`)
            .send(newComment)
        })
        .then(res => {
          expect(res).to.have.status(201);
          return chai.request(app)
            .delete(`/dreams/${testDream.id}/comments/${res.body.id}`)
            .set('authorization', `Bearer ${testUserToken}`)
        })
        .then(res => {
          expect(res).to.have.status(204);
        })
        .catch(err => handleError(err));      
    })
  });

});