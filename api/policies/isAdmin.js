'use-strict';

/**
 * @fileoverview
 * This is the code to handle the "is an admin" policy. Given a request
 * it checks whether that user is authenticated or authorised, and whether
 * the user is has an administrator role.
 *
 * @summary is an admin policy
 * @module ./isAdmin.js
 * @export isAdmin
 * @author Mario Moro Hernández
 * @license None
 * @version 0.0.alpha
 */

/* ======
   IMPORT
   ====== */
var passport = require('passport');


/**
 * <p>It checks whether a request is authenticated, and if so whether the requester
 * has an administrator role or not.</p>
 *
 * <p>If the user is an administrator, the request continues its execution. If the
 * user is not an adminstrator, the request is rejected and the corresponding
 * action is taken. This can be either redirecting to the root document, or
 * sending a 401 - Unauthorized response with a new JWT Token if the user is an
 * administrator and tried to authenticate using an expired JWT Token, or a
 * 403 - Forbidden response.</p>
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Object} next - middleware to execute next if success.
 * @return {Object} - Express response object.
 */
module.exports = function isAdmin(req, res, next) {
    isAuthorised(req, res, next, function(issueNewToken, authorised){
	//The request is authorised or the user is authenticated
	if (req.isAuthenticated() || authorised){
	    checkAdmin(req.userID).then(function(isAdmin){
		if (isAdmin && issueNewToken)
		    return handleError(req, res, issueNewToken);
		if (isAdmin)
		    return next();
		return handleError(req, res, false);
	    }).catch(function(err){
		return handleError(req, res, false);
	    });
	    return null; // To keep compiler happy.
	}

	// The request is not authorised because the token is expired
	if (req.get('Authorization') && !authorised && issueNewToken){
	    var userID = JWTService.getPayload(req.get('Authorization').split(' ')[1]).id;
	    checkAdmin(userID).then(function (isAdmin) {
		// Return a token if request comes from and admin.
		return handleError(req, res, isAdmin);
	    }).catch(function (err) {
		return handleError(req, res, false);
	    });
	    return null; //To keep compiler happy.
	}

	// Anything else
	return handleError(req, res, false);
    });
};


/* =================
   UTILITY FUNCTIONS
   ================= */

/**
 * Wrapper function for the passport.authenticate method. It returns a callback
 * with two booleans indicating, respectively, if a new token must be issued and
 * if the user request is authorised.
 *
 * @param {Object} req - Express req object.
 * @param {Object} res - Express res object.
 * @param {Function} next - Express next middleware function.
 * @param {Function} callback - callback function.
 * @return {Function} - callback function.
 */
function isAuthorised(req, res, next, callback){
    passport.authenticate('jwt', function (err, user, response) {	
	if (user)
	    return callback(false, true);
	
	if (response.name === 'TokenExpiredError') 
	    return callback(true, false);
	
	return callback(false, false);
    })(req, res, next);    
}


/**
 * Utility function to check whether a user is an admin or not.
 *
 * @param {String} userID - User unique ID string.
 * @return {Promise} - a Promise object with a boolean indicating whether the
 *                     user is an admin or not.
 */
function checkAdmin(userID) {
    return new Promise(function (resolve, reject) {
	User.findOne({userID: userID}).exec(function (err, user) {
	    if(err)
		return reject(err);

	    if (!user
		|| user.banned
		|| user.deleted
		|| !user.verified)
		return resolve(false);

	    return resolve(user.role === 3);
	});
    });
}


/**
 * Utility function to abstract the response when the request is rejected.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Boolean} issueToken - Boolean indicating whether a new JWT token must
 *                               be issued.
 */
function handleError(req, res, issueToken) {
    if (req.wantsJSON && issueToken) {
	var payload = JWTService.getPayload(req.get('Authorization').split(' ')[1]).id;
	return res.status(401).json({token: JWTService.issueToken({id: payload})});
    }

    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');

    return res.redirect('/');

}
