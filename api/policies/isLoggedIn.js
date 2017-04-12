/**
 * @fileoverview
 * This is a policy to check whether the user is logged in or not. This policy
 * is as defined in Sails.js in Action book (Ch 10 p. 267).
 */

var passport = require('passport');

module.exports = function isLoggedIn(req, res, next) {
    if (req.get('Authorization')) {
	console.log ('Authorization = ' + req.get('Authorization'));
	/*passport.authenticate('jwt', {session: false}, function (err, user, response) {
	    if (err)
		return res.negotiate(err);
	    if (user)
		return res.json(user);
	    if (!user){
		switch(response.message){
		case 'user_not_found':
		    return res.notFound('The username you entered is unknown. (isLoggedIn.js)');
		case 'wrong_password':
		    return res.notFound('The password you entered is wrong. (isLoggedIn.js)');
		case 'deleted':
		    return res.forbidden('Your account has been deleted. Please restore your account. (isLoggedIn.js)');
		case 'banned':
		    return res.forbidden('Your account has been banned. (isLoggedIn.js)');
		default:
		    console.log('response.message = ' + response.message);
		    return res.serverError('Something went wrong. (isLoggedIn.js)');
		}
	    }
	    return res.badRequest('The request was malformed.');
	 */
	passport.authenticate('jwt', function (err, user, response) {
	    console.log('req = ' + req);
	    console.log('res = ' + res);
	    console.log('next = ' + next.toString());
	    console.log('err = ' + JSON.stringify(err, null, 2));
	    console.log('user = ' + JSON.stringify(user, null, 2));
	    console.log('response = ' + JSON.stringify(response, null, 2));
	    if (err)
		return res.forbidden('You are not permitted to perform this action');
	    if (user)
		return next();
	    return res.badRequest('The request was malformed.');
	})(req, res, next);
	return null;
    }

    if (req.isAuthenticated())// || isAuthorised(req.get('Authorization')))
	return next();

    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');
    
    return res.redirect('/');
};


function isAuthorised(JWT){
    var auth = JWTService.verifyToken(JWT);
    if (!auth.error)
	return true;
    return false;
};
