var request = require('supertest-as-promised');
var rs = require('randomstring');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var _ = require('lodash');



describe('UserController', function() {

    describe('GET /user/login', function(){
      it('can successfully login user');
    });

    describe('DELETE /user/:id', function(){
      it('can sucessuflly set user as banned', function(done){
        var user;
        User.create({
          "firstName": rs.generate(10),
        	"lastName": rs.generate(10),
        	"userName": rs.generate(10),
        	"password": "p4$$w0Rd"
        }).then(function(_user){
          var user = _user;
          request(sails.hooks.http.app)
              .delete('/user/'+user.id)
              .expect(200)
              .then(function(res) {
                  var data = res.body;
                  expect(data[0].banned).to.be.ok;
                  done();
              })
              .catch(done);
        });
      });
    });
});
