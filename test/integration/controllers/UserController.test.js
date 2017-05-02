var request = require('supertest-as-promised');
var rs = require('randomstring');
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var _ = require('lodash');

describe('UserController', function() {
    var randomUser = {
	"firstName": rs.generate(10),
	"lastName": rs.generate(10),
	"email": 'mariomoro@icanplay.co.uk',
        "password": "p4$$w0Rd"
    };

    var token = '';

    // SIGN UP TEST UNITS
    describe('POST /user/signup', function() {
	it('can register a new user', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send(randomUser)
		.expect(200)
		.then(function(res) {
		    expect('Sent verification link to the specified email account').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register the same user twice', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send(randomUser)
		.expect(409)
		.then(function(res) {
		    expect('Email address is already taken by another user, please try again.'
			   || 'Username is already taken by another user, please try again.').to.be.ok;
		    done();
		})
		.catch(done);
	});

/*	it('cannot register a user with an existing username', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       userName: randomUser.userName,
		       email: 'kakotamix@yahoo.es',
		       password: 'p4SSw0Rd'
		      })
		.expect(409)
		.then(function(res){
		    expect('Username is already taken by another user, please try again.').to.be.ok;
		    done();
		})
		.catch(done);
	});*/
	
	it('cannot register a user with an existing email', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       userName: rs.generate(10),
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SSw0Rd'
		      })
		.expect(409)
		.then(function(res){
		    expect('Email address is already taken by another user, please try again.').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register a user without first name', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({lastName: rs.generate(10),
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('A first name is required').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register a user without last name', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('A last name is required').to.be.ok;
		    done();
		})
		.catch(done);
	});

/*	it('cannot register a user without user name', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: randomUser.userName,
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('A user name is required').to.be.ok;
		    done();
		})
		.catch(done);
	}); 

	it('cannot register a user whose user name has other characters than numbers or letters', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       userName: 'u$3R_n4|\/|£',
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('Invalid username: must consist of numbers and letters only').to.be.ok;
		    done();
		})
		.catch(done);
	}); */

	it('cannot register a user without email', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('An email is required').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register a user without a valid email address (as defined by RFC 5322)', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       email: 'mariomoro@icanplay',
		       password: 'p4SSw0Rd'
		      })
		.expect(400)
		.then(function(res){
		    expect('Invalid email').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register a user without a password', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       email: 'mariomoro@icanplay.co.uk'
		      })
		.expect(400)
		.then(function(res){
		    expect('A password is required').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot register a user without a password at least 6 characters long', function (done) {
	    request(sails.hooks.http.app)
		.post('/user/signup')
		.send({firstName: rs.generate(10),
		       lastName: rs.generate(10),
		       email: 'mariomoro@icanplay.co.uk',
		       password: 'p4SS'
		      })
		.expect(400)
		.then(function(res){
		    expect('Password must be at least 6 characters').to.be.ok;
		    done();
		})
		.catch(done);
	});
    });

    
    // LOG IN TEST UNITS
    describe('POST /login/', function() {

	it('cannot log in a user without email', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({password: randomUser.password})
		.expect(400)
		.then(function(res) {
		    expect('The request was malformed').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot log in a user without password', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({userName: randomUser.userName})
		.expect(400)
		.then(function(res) {
		    expect('The request was malformed').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot log in an unknown user', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'unknownUser@nodomain.no',
		       password: '123456'})
		.expect(404)
		.then(function(res) {
		    expect('The email you entered is unknown.').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot log in a known user but with wrong password', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'verified@piltrafilla.es',
		       password: 'W4t73V£r'})
		.expect(404)
		.then(function(res) {
		    expect('The password you entered is wrong.').to.be.ok;
		    done();
		})
		.catch(done);
	});	

	it('cannot log in a soft-deleted user', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'softdeleted@piltrafilla.es',
		       password: '123456'})
		.expect(403)
		.then(function(res) {
		    expect('Your account has been deleted. Please restore your account.').to.be.ok;
		    done();
		})
		.catch(done);
	});	

	it('cannot log in a banned user', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'banned@piltrafilla.es',
		       password: '123456'})
		.expect(403)
		.then(function(res) {
		    expect('Your account has been banned.').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('cannot log in a signed-up but not-verified user', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'nonverified@piltrafilla.es',
		       password: '123456'})
		.expect(403)
		.then(function(res) {
		    expect('Your account is not verified').to.be.ok;
		    done();
		})
		.catch(done);
	});

	it('can log in a registered and verified user', function (done) {
	    request(sails.hooks.http.app)
		.post('/login/')
		.send({email: 'verified@piltrafilla.es',
		       password: '123456'})
		.expect(200)
		.then(function(res) {
		    token = res.body.token;
		    expect(res.body.token).to.be.ok;
		    expect(res.body.user).to.be.ok;
		    done();
		})
		.catch(done);
	});
    });


    // LOG OUT TEST UNITS
    describe('GET /logout/', function() {

	it('can log out a logged in user', function (done) {
	    request(sails.hooks.http.app)
		.get('/logout/')
		.send({})
		.expect(302)
		.then(function(res) {
		    expect('/').to.be.ok;
		    // If logged out the call /user/profile must return 403 forbidden
		    request(sails.hooks.http.app)
			.get('/user/profile')
			.expect(403)
			.then(function (res) {
			    expect('You are not permitted to perform this action.');
			    done();
			})
			.catch(done);
		})
		.catch(done);
	});
    });
});
/*
    describe('PUT /user/login', function(){
	it('can successfully login user', function(done){
	    var user;
	    User.create({
		"firstName": rs.generate(10),
		"lastName": rs.generate(10),
		"userName": rs.generate(10),
		"email": 'mariomoro@icanplay.co.uk',
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
*/

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
//});
