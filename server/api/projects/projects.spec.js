'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/projects', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/projects')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          console.log("\n\nERROR: res = ", res, "\n\nerr = ", err);
          return done(err);
        }
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});