/**
 * @fileoverview
 * This is a policy to check whether the user is logged in or not. This policy
 * is as defined in Sails.js in Action book (Ch 10 p. 267).
 */

module.exports = function isLoggedIn(req, res, next) {
    //console.log('req.session.passport.user = ' + req.session.passport.user);
    var auth = isAuthorised(req.get('Authorization'));
    console.log('auth = ' + auth);
    if (req.isAuthenticated() || auth)
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

/*
// Asynchronous version of isAuthorised. It doesn't work because of a race condition.
function isAuthorised(JWT){
    JWTService.verifyTokenAsync(JWT)
	.then(function(err) {
	    if (err) return false;
	    return true;
	})
	.catch(
	    function (){
		return false;
	    });
};
*/
