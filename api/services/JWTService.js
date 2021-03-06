'use-strict';

/**
 * @fileoverview
 * This is a service to sign and verify JSON Web Tokens (JWT) to authorise
 * requests made to the server.
 *
 * @summary JWT service.
 * @requires jsonwebtoken.js
 * @export issueToken
 * @export verifyToken
 * @author Mario Moro Hernández
 * @license None
 * @version 0.0.alpha
 */

/* ======
   IMPORT
   ====== */
var jwt = require('jsonwebtoken');


module.exports = {
    /**
     * Provided a payload, a secret or a private key, and some options, it
     * returns a JWT token. Note that this function is synchronous.
     *
     * @param {Object} payload - an object containin the information passed to
     *                           the JWT body.
     * @param {String} secretOrPrivatekey - Encryption key.
     * @param {Object} options - JWT options.
     * @return {String} a JWT token.
     */
    issueToken: function (payload, secretOrPrivatekey, options){
	// validate key and options
	if (!secretOrPrivatekey)
	    secretOrPrivatekey = sails.config.jwtSettings.secret;

	if (!options) {
	    options = {
		algorithm: sails.config.jwtSettings.algorithm,
		expiresIn: sails.config.jwtSettings.expiresIn,
		issuer: sails.config.jwtSettings.issuer,
		audience: sails.config.jwtSettings.audience
	    };
	}

	// generate token
	return jwt.sign(payload, secretOrPrivatekey, options);
    },

    /**
     * Provided a payload, a secret or a private key, and some options, it
     * returns a promise with a JWT token. This function is the asynchronous
     * version of the issueToken function.
     *
     * @param {Object} payload - an object containin the information passed to
     *                           the JWT body.
     * @param {String} secretOrPrivatekey - Encryption key.
     * @param {Object} options - JWT options.
     * @return {Promise} promise object with a JWT token.
     */
    issueTokenAsync: function (payload, secretOrPrivatekey, options){
	// validate key and options
	if (!secretOrPrivatekey)
	    secretOrPrivatekey = sails.config.jwtSettings.secret;

	if (!options) {
	    options = {
		algorithm: sails.config.jwtSettings.algorithm,
		expiresIn: sails.config.jwtSettings.expiresIn,
		issuer: sails.config.jwtSettings.issuer,
		audience: sails.config.jwtSettings.audience
	    };
	}
	
	// generate token
	 return new Promise(function(resolve, reject) {
	    jwt.sign(payload, secretOrPrivatekey, options, function(err, token) {
		if (err) return reject(err);
		return resolve(token);
	    });
	});
    },

    /**
     * It verifies a JWT token and returns a an object with the decoded token or
     * an error if something went wrong. Note that this function is synchronous.
     *
     * @param {String} token -  JWT token.
     * @param {String} secretOrPrivatekey - Encryption secret.
     * @param {Object} options - JWT options.
     * @return {Object} - object with the decoded JWT token or an error.
     */
    verifyToken: function (token, secretOrPublicKey, options){
	// validate key and options
	if (!secretOrPublicKey)
	    secretOrPublicKey = sails.config.jwtSettings.secret;

	if (!options)
	    options = {};
	
	// validate token
	try {
	    return jwt.verify(token, secretOrPublicKey, options);
	} catch (err) {
	    return {error: err};
	}
    },


    /**
     * It verifies a JWT token and returns a promise with the decoded token or an
     * error if something went wrong. This function is the asynchronous version 
     * of the verifyToken function.
     *
     * @param {Object} token - A JWT token.
     * @param {String} secretOrPrivatekey - Encryption secret.
     * @param {Object} options - JWT options.
     * @return {Promise} promise object with the decoded  JWT token or an error.
     */
    verifyTokenAsync: function (token, secretOrPublicKey, options) {
	// validate key and options
	if (!secretOrPublicKey)
	    secretOrPublicKey = sails.config.jwtSettings.secret;

	if (!options)
	    options = {};
    
	// validate token
	return new Promise(function (resolve, reject) {
	    jwt.verify(token, secretOrPublicKey, options, function (err, decodedToken){
		if (err){
		    return reject(err);
		}
		return resolve(decodedToken);
	    });
	});
    },

    getPayload: function (token, secretOrPublicKey, options) {
	if (!secretOrPublicKey)
	    secretOrPublicKey = sails.config.jwtSettings.secret;
	
	if (!(options === undefined || options === null))
	    options.ignoreExpiration = true;
	else
	    options = {ignoreExpiration: true};
	
	try {
	    return jwt.verify(token, secretOrPublicKey, options);
	} catch (err) {
	    return {error: err};
	}
    },


    /**
     * @deprecated
     * this is going to cause problems... 
     * 
     * check
     *     http://angular-tips.com/blog/2014/05/json-web-tokens-examples/
     *
     * and
     *     https://github.com/ProLoser/angular-sails-seed/blob/master/backend/api/services/Token.js
     *
     * on the other hand, this is the isAuthorized.js policy in
     *     https://thesabbir.com/how-to-use-json-web-token-authentication-with-sails-js/
     */
    getToken: function (req, next, throwError) {
	var token;
	if (req.headers && req.headers.authorization) {
	    var parts = req.headers.authorization.split(' ');

	    if (parts.length === 2){
		var scheme = parts[0];
		var credentials = parts[1];

		if (/^Bearer$/i.test(scheme))
		    token = credentials;
	    } else if (throwError)
	    // 401 Unauthorized
	    throw new Error('invalid authorization header format. Format is Authorization: Bearer [token]');
	} else if (req.param('token')) {
	    token = req.param('token');
	} else if (throwError) {
	    // 401 Unauthorized
	    throw new Error('No authorization header was found');
	}

	return sails.services('jWTService').verifyToken(token);
    }
};
