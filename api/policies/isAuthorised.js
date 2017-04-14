var passport = require('passport');

module.exports = function isAuthorised(req, res, next){
    passport.authenticate('jwt', function(err, user, response) {
	if (err)
	    return res.forbidden('You are not permitted to perform this action');
	if (user)
	    return next();
	return res.badRequest('The request was malformed.');
    })(req,res,next);
};
