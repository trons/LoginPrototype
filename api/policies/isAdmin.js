module.exports = function isAdmin(req, res, next){
    if (!req.isAuthenticated())
	handleError(req,res);

    User.findOne(req.session.passport.user).exec(function (err, foundUser) {
	if (err)
	    return res.negotiate(err);

	if (foundUser.admin)
	    return next();

	handleError(req, res);

	return null; // To keep compiler happy.
    });

    return null; // To keep compiler happy. 
};

function handleError(req, res) {
    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');
    return res.redirect('/');

}
