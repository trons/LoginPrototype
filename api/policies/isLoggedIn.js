'use-strict';

/**
 * @fileoverview
 * This is the code to handle the "is logged in" policy. Given a request
 * it checks whether that user is authenticated or authorised.
 *
 * @summary is logged in policy
 * @module ./isLoggedIn.js
 * @export isLoggedIn
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
module.exports = function isLoggedIn(req, res, next) {
    isAuthorised(req, res, next, function(issueNewToken, authorised){
	if (req.isAuthenticated() || authorised)
	    return next();

	if (req.wantsJSON && issueNewToken) {
	    var payload = JWTService.getPayload(req.get('Authorization').split(' ')[1]).id;
	    User.findOne({userID: payload}).exec(function (err, user){
		if (err) return res.negotiate(err);
		if (!user
		    || user.banned
		    || user.deleted
		    || !user.verified)
		    return res.forbidden('You are not permitted to perform this action.');
		
		return res.status(401).json({token: JWTService.issueToken({id: payload})});
	    });
	    return null; // To prevent 'Can't set headers after they are sent' error.
	}
	
	if (req.wantsJSON)
	    return res.forbidden('You are not permitted to perform this action.');
	
	return res.redirect('/');
    });
};


/**
 * Wrapper function for the passport.authenticate method. It returns a callback
 * with two booleans indicating, respectively, if a new token must be issued and
 * if the user is authorised.
 *
 * @param {Object} req - Express req object.
 * @param {Object} res - Express res object.
 * @param {Function} next - Express next middleware function.
 * @param {Function} callback - callback function.
 * @return {Function} - callback function.
 */
function isAuthorised(req, res, next, callback){
    passport.authenticate('jwt', function(err, user, response) {
	if (user)
	    return callback(false, true);

	if (response.name === 'TokenExpiredError')
	    return callback(true, false);
	    
	return callback(false, false);
    })(req, res, next);
};

/*
 The policy above and the policy below are equivalent. The only difference is
 that the code above this comment makes use of the passport 'jwt' strategy,
 whereas the code below makes use of the 'jsonwebtoken' library.

 This implies that the authorization header in the first case must be of the
 form:
   'Authorization: JWT <token>'
 while in the second case must be:
   'Authorization: <token>'
*/

/*
// This needs to be updated
module.exports = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || isAuthorised(req.get('Authorization')))
	return next();

    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');

    return res.redirect('/');
};

//custom function verification function
function isAuthorised(JWT){
    var auth = JWTService.verifyToken(JWT);
    if (!auth.error)
	return true;
    return false;
};
*/
