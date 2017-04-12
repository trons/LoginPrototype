'use strict';

/**
 * @fileoverview
 * This file implements different strategies for user authentication and 
 * authorisation using the Passport library. This is based on an example
 * by Ghadeer Rahhal that can be found at
 *   https://www.ghadeer.io/sails-application-passportjs/
 * and an example by Eric Swann that can be found at
 *   https://ericswann.wordpress.com/2015/04/24/nozus-js-1-intro-to-sails-with-passport-and-jwt-json-web-token-auth/
 *
 * @summary Passport strategies definition.
 * @module ./passport.js
 * @requires passport.js
 * @requires passport-local.js
 * @requires passport-jwt.js
 * @exports jwtSettings
 * @author Mario Moro Hernández upon an example by Ghadeer Rahhal.
 * @license None
 * @version 0.0.alpha
 */

/* ======
   IMPORT
   ====== */
var passport = require('passport'),
    LocalStrategy = require('passport-local'),
    JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// JWT Configuration
var SECRET = process.env.tokenSecret || 'jwt-secret';
var EXPIRES_IN = 10 * 60;
var ALGORITHM = 'HS256';
var ISSUER = 'accounts.examplesoft.com';
var AUDIENCE = 'yoursite.net';

var DEFAULT_OPTIONS = {
    expiresIn: EXPIRES_IN,
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE    
};

/* ======
   EXPORT
   ====== */
module.exports.jwtSettings = {
    expiresIn: EXPIRES_IN,
    secret: SECRET,
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE    
};

// After passport serialises the user, return the ID.
passport.serializeUser(function (user, done) {
    if (!user)
	done({message: 'Invalid user.'}, null);
    else
	done(null, user.id); // <---- only user ID is serialised to the session.
});

// Passport deserialises the user by ID and returns the full user object.
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) { // <---- changed to findById to prevent deserialize error with redis.
	done(err, user);
    });
});

//Register the Local Strategy with Passport.
passport.use(new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, _verifyLocalHandler));

//Register the JWT Strategy with Passport.
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: SECRET,
    issuer: ISSUER,
    audience: AUDIENCE,
    passReqToCallback: true
}, _verifyJwtHandler));


/* ------------------------
   VERIFY HANDLER FUNCTIONS
   ------------------------ */
function _verifyLocalHandler(req, username, password, done) {
    process.nextTick(function () {
	User.findOne({userName: username}).exec(function (err, user) {
	    // handle Mongo DB error
	    if (err) return done(err);

	    // user not found
	    if (!user) return done(null, false, {message: 'user_not_found'});

	    // check password
	    var checkPassword = PasswordsService.compare(req.param('password'), user.encryptedPassword);

	    checkPassword.then(function (match) {
		// Promise was successful
		if (!match)
		    return done(null, false, {message: 'wrong_password'});
		
		if (user.deleted)
		    return done(null, false, {message: 'deleted'});

		if (user.banned)
		    return done(null, false, {message: 'banned'});

		if (!user.verified)
		    return done(null, false, {message: 'not-verified'});

		// Login user
		req.login(user, function (err) {
		    if (err)
			return done(null, false, {message: err});
		    // Respond with 200 OK status
		    return done(null, {token: JWTService.issueToken({user: user.id}, SECRET, DEFAULT_OPTIONS),
				       user: user}, {message: 'logged_in'});
		});

		return null;
	    }).catch(function (err) {
		// Promise failed, therefeore it fails misserably
		return done(err);
	    });

	    return null; // To keep compiler happy.
	});
    });
};

function _verifyJwtHandler(req, jwtPayload, done) {
    process.nextTick(function () {
	console.log('in_verfiyJwtHandler process.nextTick(function()');
	User.findOne({id: jwtPayload.id}).exec(function (err, user) {
	    console.log('in_verfiyJwtHandler process.nextTick(function()\n'+
		        'User.findone({id: jwtPayload.id}).exec(function(err, user)');
	    //handle Mongo DB error
	    if (err) return done(err);
	    
	    // user not found
	    if (!user) return done(null, false, {message: 'user_not_found'});

	    // check token
	    var checkToken = JWTService.verifyToken(jwtPayload, SECRET, {});

	    checkToken.then (function(err){
		console.log('in _verifyJwtHandler(req, jwtPayload, done .then');
		// TO DO: ALL THIS SHIT
		if (err)
		    return done(null, false, {message:err});
		// Respond with 200 OK status
		return done(null, user, {message: 'authorized'});
	    }).catch(function (err){
		return done(err);
	    });

	    return null; // To keep compiler happy.
	});
    });    
};

