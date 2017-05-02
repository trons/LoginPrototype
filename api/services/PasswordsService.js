'use-strict';

/**
 * @fileoverview
 * This is a wrapper module to <em>promisify</em> the encrypt and compare
 * passwords operations.
 *
 * @summary bcryptjs wrapper.
 * @module ./PasswordsService.js
 * @requires bcryptjs.js
 * @export encrypt
 * @export compare
 * @author Mario Moro Hernández
 * @license None
 * @version 0.0.alpha
 */
 
// bcrypt encryption libary to encrypt the password.
var bcrypt = require('bcryptjs');

module.exports = {
    /**
     * It encrypts a password using the bcrytp password hashing algorithm
     * (cf. https://en.wikipedia.org/wiki/Bcrypt). It returns a promise
     * containing a salted-hash string (or an error if it fails).
     *
     * @param {string} plainPassword - A string with the pasword to encrypt.
     * @return {Promise} promise object with a hash string or an error object.
     */
    encrypt: function (plainPassword) {
	return new Promise(function(resolve, reject) {
	    bcrypt.hash(plainPassword, 10, function (err, hash) {
		if (err) return reject(err);
		return resolve(hash);
	    });
	});
    },

    /**
     * It compares a plain-text password and an encrypted password using the 
     * bcrytp password hashing algorithm. It returns a promise with a boolean
     * indicating whether both passwords match (or an error if it fails).
     *
     * @param {string} plainPassword - A string with the password to compare.
     * @param {string} encryptedPassword - A string to which the plainPassword
     *                                     is compared.
     * @return {Promise} promise object with a hash string or an error object.
     */
    compare: function (plainPassword, encryptedPassword){
	return new Promise(function(resolve, reject) {
	    bcrypt.compare(plainPassword, encryptedPassword, function(err, match) {
		if (err) return reject(err);
		return resolve(match);
	    });
	});
    },

    generatePassword: function (length){
	const letters = 'abcdefghijklmnopqrstuvwxyz';
	const digits = '1234567890';
	const symbols = '!$()-_/\|<>';
	var password = '';

	for (var i = 0; i < length; i++){
	    switch(Math.floor(Math.random() * 3) + 1){
	    case 1:
		var character = letters.charAt(Math.floor(Math.random() * letters.length));
		if (Math.floor(Math.random() * 2) === 0){
		    password += character.toUpperCase();
		    break;
		}
		password += character;
		break;
	    case 2:
		password += digits.charAt(Math.floor(Math.random() * digits.length));
		break;
	    case 3:
		password += symbols.charAt(Math.floor(Math.random() * symbols.length));
		break;
	    default:
		password += '£';
	    }
	}

	return password;
    },

    /*
     This is not needed really. It can be done with the generate function from the
     VerificationEmailService.js (cf. the comment there for more details).
     */
    sendMail: function (user){
	return new Promise(function (resolve, reject) {
	    var token = JWTService.issueToken({user: user.userName}, // payload
					      undefined, // secret (undefined, so the service uses the default)
					      {algorithm: sails.config.jwtSettings.algorithm, // options
					       expiresIn: 5 * 60, // <---- Link expires in 5 minutes
					       issuer: sails.config.jwtSettings.issuer,
					       audience: sails.config.jwtSettings.audience});
	    
	    var link = 'http://localhost:1337/user/reset-password/' + token;
	    
	    // Send verification email
	    SendgridService.send({
		to: [{name: user.firstName + ' ' + user.lastName, email: user.email}],
		from: {name : 'admin', email : 'noreply@someservice.ml'},
		subject: 'Password reset',
		body: {text: '<H1>Reset your password</H1><br>' +
		       '<p>We received a request to reset your password.<br><br>' +
		       'If it was not you, please ignore this email.<br><br> ' + 
		       'If you want to reset your password, please click on this link:<br>' +
		       link + '</p>',
		       format: 'html'}
	    }, function(err, data) {
		if (err) return reject(err);
		return resolve('Sent verification link to the specified email account');
	    });	
	});
    }
};
