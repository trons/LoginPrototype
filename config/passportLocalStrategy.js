'use strict';

/* ======
   IMPORT
   ====== */
var passport = require('passport'),
    LocalStrategy = require('passport-local'),
    bcrypt = require('bcryptjs');

// After passport serialises the user, return the ID.
passport.serializeUser(function (user, done) {
    done(null, user.id); // <---- only user ID is serialised to the session.
});

// Passport deserialises the user by ID and returns the full user object.
passport.deserializeUser(function (id, done) {
    User.findOne({id: id}, function (err, user){
	done(err, user);
    });
});

var verifyHandler = function (req, username, password, done) {
    process.nextTick(function () {
	User.findOne({userName: username}).exec(function foundUser(err, createdUser) {
	    // handle Mongo DB error
	    if (err) return done(err);
	    // user not found
	    if (!createdUser) return done(null, false, {message: 'user_not_found'});
	    // check password
	    var checkPassword = new Promise(function(resolve, reject) {
		bcrypt.compare(req.param('password'), createdUser.encryptedPassword, function (err, match){
		    if (err)
			return reject(err);
		    resolve(match);
		    return null; // To keep compiler happy.
		});
	    });

	    checkPassword.then(function (match){
		// Promise was successful
		if (!match)
		    return done(null, false, {message: 'wrong_password'});
		
		if (createdUser.deleted)
		    return done(null, false, {message: 'deleted'});

		if (createdUser.banned)
		    return done(null, false, {message: 'banned'});

		// Login user
		req.login(createdUser, function (err){
		    if (err) return done(null, false, {message: err});
		    // Respond with 200 OK status
		    return done(null, createdUser, {message: 'Successfully logged in.'});
		});

		return null;
	    }, function (err){
		// Promise failed, therefeore it fails misserably
		return done(err);
	    });

	    return null; // To keep compiler happy.
	});
    });
};

//Register the Local Strategy with Passport.
passport.use(new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, verifyHandler));
