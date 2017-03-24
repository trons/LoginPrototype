/**
 * @fileoverview
 * This is a policy to check whether the user is logged in or not. This policy
 * is as defined in Sails.js in Action book (Ch 10 p. 267).
 */

module.exports = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
	return next();
    
    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');
    
    return res.redirect('/');
};
