'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Dream Catcher public html tests', () => {
  before(() => {
    return runServer();
  });

  after(() => {
    return closeServer();
  });

  it('Should serve index.html', () => {
    return chai.request(app)
      .get('/index.html')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});


