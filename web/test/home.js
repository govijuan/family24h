'use strict'

process.env.NODE_ENV = 'test';

var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should;
var supertest = require('supertest');
var api = supertest('http://localhost:3000');
 
 //

describe('Home', function () {
  describe('General', function() {
    it('should return a 200 response', function(done) {
      api.get('/')
      .expect(200,done)
    });
  });
});