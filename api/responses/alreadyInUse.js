/**
 * 409 (Conflict) Handler (Already in use)
 *
 * Usage:
 * return res.alreadyInUse();
 * return res.alreadyInUse(err);
 *
 * e.g.:
 * ```
 * return res.alreadyInUse(err);
 *
 * NOTE:
 * This is a custom-made user created response to handle the case when a username
 * is already in the database.
 */

module.exports = function alreadyInUse(err) {
    // Get access to `res` (since the arguments are up to us)
    var res = this.res;
    if (err.invalidAttributes.userName)
	return res.send(409, 'Username is already taken by another user, please try again.');

    return res.send(500);
};
