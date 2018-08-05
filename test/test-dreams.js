const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

mongoose.Promise = global.Promise;

const { Dream } = require('../dreams/models');
const { User } = require('../users/models');
const { Comment } = require('../comments/models');

const { app, runServer, closeServer } = require('../server');
const  {TEST_DATABASE_URL } = require('../config');

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
      return User.findOne({ _id: { $ne: user.id } });
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

describe('dreams API resource', () => {
  
  before(() => {
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(() => {
    return seedDataAndGenerateTestUsers();
  });

  afterEach(() => {
    return tearDownDb();
  });

  after(() => {
    return closeServer();
  });  

  describe('GET endpoint - unauthorized', () => {

    it('Should return all public dreams', () => {
      let res;
      return chai.request(app)
        .get('/dreams')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.dreams).to.have.lengthOf.at.least(1);
          return Dream.countDocuments();
        })
        .then(function(count) {
          expect(res.body.dreams).to.have.lengthOf(count);
        })
        .catch(err => handleError(err));
    });

    it('Should return public dreams with the right fields', () => {
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
        })
        .catch(err => handleError(err));
    });    

  });

  describe('GET endpoint - authorized', () => {

    it('Should send user dreams for authorized user', () => {
      return chai.request(app)
        .get('/dreams')
        .set('authorization', `Bearer ${testUserToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
        })
        .catch(err => handleError(err));
    });

    it('Should return user dreams with the right fields', () => {
      let resDream;
      return chai.request(app)
        .get('/dreams?personal=true')
        .set('authorization', `Bearer ${testUserToken}`)
        .then(function(res) {
          // so subsequent .then blocks can access response object
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.dreams).to.have.lengthOf.at.least(1);

          res.body.dreams.forEach(function(dream) {
            expect(dream).to.be.a('object');
            expect(dream).to.include.keys('_id', 'title', 'text', 'publishDate');
          });
          resDream = res.body.dreams[0];          
          return Dream.findById(resDream._id)
            .populate('author', 'firstName lastName screenName');
        })
        .then(function(dream) {
          expect(resDream._id).to.equal(dream.id);
          expect(resDream.title).to.equal(dream.title);
          expect(resDream.text).to.equal(dream.text);
          expect(new Date(resDream.publishDate)).to.equalDate(new Date(dream.publishDate));
        })
        .catch(err => handleError(err));
    });

    it('Should return the correct number of user dreams', () => {
      let resDreamCount;
      return chai.request(app)
        .get('/dreams?personal=true')
        .set('authorization', `Bearer ${testUserToken}`)
        .then(function(res) {
          resDreamCount = res.body.dreams.length;
          return Dream.countDocuments({author: testUser._id});
        })
        .then(function (count) {
          expect(count).to.equal(resDreamCount);
        })
        .catch(err => handleError(err));
    });
  });

  describe('GET /dreams/:id', () => {

    it('Should allow an unathorized user to request a public dream', () => {
      return chai.request(app)
        .get(`/dreams/${testDream._id}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('_id', 'title', 'author', 'text', 'publishDate');
          expect(res.body._id).to.equal(testDream._id.toString());
          expect(res.body.title).to.equal(testDream.title);
          expect(res.body.text).to.equal(testDream.text);
          expect(new Date(res.body.publishDate)).to.equalDate(new Date(dream.publishDate));
        })
        .catch(err => handleError(err));
    });

    it('Should not allow an unathorized user to request a private dream', () => {
      return Dream.findByIdAndUpdate(testDream.id, {$set: {public: false}})
        .then(() => {
          return chai.request(app)
            .get(`/dreams/${testDream.id}`)
        })
        .then(res => {
          expect(res).to.have.status(401);
        })
        .catch(err => handleError(err));
      });

      it('Should allow an authorized user to request a public dream', () => {
        return chai.request(app)
        .get(`/dreams/${testDream.id}`)
        .set('authorization', `Bearer ${testUserToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('_id', 'title', 'author', 'text', 'publishDate');
          expect(res.body._id).to.equal(testDream.id);
          expect(res.body.title).to.equal(testDream.title);
          expect(res.body.text).to.equal(testDream.text);
          expect(new Date(res.body.publishDate)).to.equalDate(new Date(dream.publishDate));
        })
        .catch(err => handleError(err));        
      });

      it('Should allow an authorized user to request a private dream of theirs', () => {
        return Dream.findByIdAndUpdate(testDream.id, {$set: {public: false, author: testUser.id}})
        .then(() => {
          return chai.request(app)
            .get(`/dreams/${testDream.id}`)
            .set('authorization', `Bearer ${testUserToken}`)
        })
        .then(res => {
          expect(res).to.have.status(200);
        })
        .catch(err => handleError(err));
      });      
      
      it('Should not allow an authorized user to request a private dream not of theirs', () => {
        return Dream.findByIdAndUpdate(testDream.id, {$set: {public: false, author: testUser2.id}})
        .then(() => {
          return chai.request(app)
            .get(`/dreams/${testDream.id}`)
            .set('authorization', `Bearer ${testUserToken}`)
        })
        .then(res => {
          expect(res).to.have.status(401);
        })
        .catch(err => handleError(err));
      });        
  });

  describe('POST endpoint', () => {

    it('Should not allow an unauthorized request to post', () =>{
      return chai.request(app)
        .post('/dreams')
        .then(function(res) {
          expect(res).to.have.status(401);
        })
    });

    it('Should add a new dream', () => {
      const newDream = generateDreamData(testUser.id);

      return chai.request(app)
        .post('/dreams')
        .set('authorization', `Bearer ${testUserToken}`)
        .send(newDream)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'text', 'publishDate', 'public', 'commentsOn', 'comments');
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newDream.title);
          expect(res.body.text).to.equal(newDream.text);

          return Dream.findById(res.body.id);
        })
        .then(function(dream) {
          expect(dream.title).to.equal(newDream.title);
          expect(dream.text).to.equal(newDream.text);
        })
        .catch(err => handleError(err));
    });
  });

  describe('PUT endpont', () => {

    it('Should not allow an unauthorized request to put', () =>{
      return chai.request(app)
        .put('/dreams')
        .then(function(res) {
          expect(res).to.have.status(404);
        })
        .catch(err => handleError(err));
    });

    it('Should update dream document with supplied fields', () => {
      const updateData = {
        title: 'New Title',
        text: 'New text',
        public: false,
        commentsOn: false
      }

      return Dream
        .findOne({author: testUser.id})
        .then(function(dream) {
          updateData.id = dream.id;
        return chai.request(app)
          .put(`/dreams/${dream.id}`)
          .set('authorization', `Bearer ${testUserToken}`)
          .send(updateData)           
        })
        .then(function(res) {
          expect(res).to.have.status(200);

          return Dream.findById(updateData.id);
        })
        .then(function(dream) {
          expect(dream.title).to.equal(updateData.title);
          expect(dream.text).to.equal(updateData.text);
          expect(dream.public).to.equal(updateData.public);
          expect(dream.commentsOn,).to.equal(updateData.commentsOn);
        })
        .catch(err => handleError(err));
    });
  });

  describe('DELETE endpoint', () => {

    it('Should not allow an unauthorized request to delete', () =>{
      return chai.request(app)
        .delete('/dreams')
        .then(function(res) {
          expect(res).to.have.status(404);
        })
    });

    it('Should not allow an authorized user to delete a dream that is not theirs', () =>{
      let dream;

      return Dream
        .findOne({author: {$not: {$eq: testUser.id}}})
        .then(function(_dream) {
          dream = _dream;

          return chai.request(app)
            .delete(`/dreams/${dream.id}`)
            .set('authorization', `Bearer ${testUserToken}`);
        })
        .then(function(res) {
          expect(res).to.have.status(401);
        })
        .catch(err => handleError(err));
    });       

    it('Should delete a dream by id, delete any comments on it, and update dream reference in user document', () => {
      const newComment = generateCommentData(testUser2.id);
      let dream;
      let comment

      return Dream
        .findOne({author: testUser.id})
        .then(function(_dream) {
          dream = _dream;
          return Dream
            .findByIdAndUpdate(testDream.id, {$set: {commentsOn: true}});
        })
        .then(() => {
          return chai.request(app)
            .post(`/dreams/${dream.id}/comments`)
            .set('authorization', `Bearer ${testUser2Token}`)
            .send(newComment)
        })
        .then(res => {
          comment = res.body;
          return Dream.findById(testDream.id);
        })
        .then(dream => {
          expect(dream.comments).to.include(comment.id);
          return chai.request(app)
            .delete(`/dreams/${dream.id}`)
            .set('authorization', `Bearer ${testUserToken}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Comment.findById(comment.id);
        })
        .then(comment => {
          expect(comment).to.be.null;
          return User.findById(testUser.id);
        })
        .then(function(user) {
          expect(user.dreams).to.not.include(dream.id);
        })
        .catch(err => handleError(err));
    });
  });
});