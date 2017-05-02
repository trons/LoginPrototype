/**
 * @fileoverview
 * This is the code to handle the "is an admin" policy. Given a request
 * it checks whether that user is authenticated, and whether the user
 * is has an administrator role.
 *
 * @summary is an admin policy
 * @module ./isAdmin.js
 * @export isAdmin
 * @author Mario Moro Hernández (based on the 'Sails in Action' example)
 * @license None
 * @version 0.0.alpha
 */

/**
 * <p>It checks whether a request is authenticated, and if so whether the requester
 * has an administrator role or not.</p>
 *
 * If the user is an administrator, the request continues its execution. If the
 * user is not an adminstrator, the request is rejected and the corresponding action
 * is taken. This can be either redirect to the root document or sending a 403 - 
 * Forbidden response.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} next - middleware to execute next if success.
 * @return {object} - Express response object.
 */
module.exports = function isAdmin(req, res, next) {
    if (!req.isAuthenticated())
	handleError(req,res);

    User.findOne(req.session.passport.user).exec(function (err, user) {
	if (err)
	    return res.negotiate(err);

	if (user.role === 3)
	    return next();

	handleError(req, res);

	return null; // To keep compiler happy.
    });

    return null; // To keep compiler happy. 
};

/**
 * Utility function to abstract the response when the request is rejected.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
function handleError(req, res) {
    if (req.wantsJSON)
	return res.forbidden('You are not permitted to perform this action.');
    return res.redirect('/');

}
