/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

    User.count().exec(function(err, numUsers) {
	if (err) {
	    return cb(err);
	}

	if (numUsers > 0) {
	    console.log('Number of users: ', numUsers);
	    return cb();
	};

	// Create an administrator user for test purposes
	User.create({
	    firstName: "John",
	    lastName: "Doe",
	    userName: "admin",
	    encryptedPassword: "$2a$10$bzMEjvt9ks0fL0pf2qqWZej3XyusAnjbpKxDqkQq76C6Ws8pX5gBG", // 123456
	    deleted: false,
	    banned: false,
	    admin: true
	}).exec({
	    error: function (err) {
		console.log('ERROR: ' + JSON.stringify(err, null, 2));
		return cb(err);
	    },
	    success: function (data) {
		return cb();
	    }
	});

	//console.log('There are no user records.');
	//return cb();
	return null; // To keep compiler happy.
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    //cb();
};
