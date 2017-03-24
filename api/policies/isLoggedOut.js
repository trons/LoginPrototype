module.exports = function isLoggedOut(req, res, next){
    if (!req.isAuthenticated())
	return next();
    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');
    return res.redirect('/');
}
