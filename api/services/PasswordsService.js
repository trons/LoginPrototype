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
    }
};
