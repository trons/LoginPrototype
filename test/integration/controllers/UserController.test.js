var request = require('supertest-as-promised');
var rs = require('randomstring');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var _ = require('lodash');



describe('UserController', function() {

    describe('POST /user/signup', function() {
	it('can successfully signup', function (done) {
	    var user = {
		"firstName": rs.generate(10),
		"lastName": rs.generate(10),
		"userName": rs.generate(10),
        	"password": "p4$$w0Rd"
	    };
	    //User.create(user).then(function(_user){
	    //var user = _user;
	    request(sails.hooks.http.app)
		.post('/user/signup').
		send({
		    "firstName": rs.generate(10),
		    "lastName": rs.generate(10),
		    "userName": rs.generate(10),
        	    "password": "p4$$w0Rd"
		})
		.expect(200)
		.then(function(res) {
		    expect(res.body.userName).to.be.ok;
		    done();
		})
		.catch(done);
	});
    });


    describe('PUT /user/login', function(){
	it('can successfully login user', function(done){
	    var user;
	    User.create({
		"firstName": rs.generate(10),
		"lastName": rs.generate(10),
		"userName": rs.generate(10),
        	"password": "p4$$w0Rd"
	    }).then(function(_user){
		var user = _user;
		request(sails.hooks.http.app)
		    .put('/user/login/')
		    .send({
			userName: user.userName,
			password: user.password
		    })
		    .expect(200)
		    .then(function(res) {
			expect(res.session.userId).to.be.ok;
			done();
		    })
		    .catch(done);
	    });
	});
    });
    
    describe('PUT /user/remove-profile', function() {
	it('can successfully set user.deleted to false', function (done) {
	    var user;
	    User.create({
		"firstName": rs.generate(10),
		"lastName": rs.generate(10),
		"userName": rs.generate(10),
        	"password": "p4$$w0Rd"
	    }).then(function (_user) {
		var user = _user;
		request(sails.hooks.http.app)
		    .delete('/user/remove-profile/')
		    .expect(200)
		    .then(function (res) {
			var data = res.body;
			expect(data[0].deleted).to.be.ok;
			done();
		    }).catch(done);
	    });
	});
    });

    /*describe('DELETE /user/:id', function(){
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
			expect(data[0].deleted).to.be.ok;
			done();
		    })
		    .catch(done);
            });
	});
    });*/
});
