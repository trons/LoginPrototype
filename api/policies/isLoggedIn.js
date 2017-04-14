/**
 * @fileoverview
 * This is a policy to check whether the user is logged in or not. This policy
 * is as defined in Sails.js in Action book (Ch 10 p. 267).
 */

var passport = require('passport');

module.exports = function isLoggedIn(req, res, next) {
    isAuthorised(req, res, next, function(val){
	if (req.isAuthenticated() || val)
	    return next();

	if (req.wantsJSON)
	    return res.forbidden('You are not permitted to perform this action.');
	
	return res.redirect('/');
    });
};

//passport library wrapper function
function isAuthorised(req, res, next, callback){
    passport.authenticate('jwt', function(err, user, response) {
	if (user) return callback(true);
	return callback(false);
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
