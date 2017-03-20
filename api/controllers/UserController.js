/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/* ======
   IMPORT
   ====== */
/*
 bcrypt encryption module to encrypt the password. The example in the book
 imports a wrapper to this library. Here we do the same but simpler using a
 promise.
 */
var bcrypt = require('bcryptjs');

/* ======
   EXPORT
   ====== */
module.exports = {
    /**
     * LOGIN
     *   It handles a user's login.
     *
     * + URL: /login
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {userName: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 404
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    login: function(req, res){
	// All this must be replaced with the PASSPORT library later.
	User.findOne({
	    or : [
		{email: req.param('email')},
		{userName: req.param('userName')}
	    ]
	}, function foundUser(err, createdUser) {
	    // handle Mongo DB error
	    if (err) return res.negotiate(err);
	    // user not found
	    if (!createdUser) return res.notFound();
	    // check password
	    new Promise(function(resolve, reject) {
		bcrypt.compare(req.param('password'), createdUser.encryptedPassword, function (err, match){
		    if (err)
			return reject(err);
		    resolve(match);
		    return null; // To keep compiler happy.
		});
	    }).then(function (match){
		// Promise was successful
		if (!match)
		    return res.notFound();

		if (createdUser.deleted)
		    return res.forbidden("'Your account has been deleted. Please restore your account'");

		if (createdUser.banned)
		    return res.forbidden("'Your account has been banned.'");

		// Login user
		req.session.userId = createdUser.id;
		// Respond with 200 OK status
		return res.ok();
	    }, function (err){
		// Promise failed, therefeore it fails misserably
		return res.status(500).send('Bcrypt error.');
	    });
	    return null; // To keep compiler happy.
	});
    },

    /**
     * LOGOUT
     *   It handles a user's logout.
     *
     * + URL: /logout
     * + Method: GET
     * + URL Params: None
     * + Data Params: {userName: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 404
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    logout: function (req, res) {
	if (!req.session.userId)
	    return res.redirect('/');
	User.findOne(req.session.userId, function foundUser(err, createdUser){
	    if (err)
		return res.negotiate(err);
	    if (!createdUser){
		sails.log.verbose('Sessionrefers to a user who no longer exists');
		return res.redirect('/');
	    }
	    req.session.userId = null;
	    return res.redirect('/');
	});
	return null; // To keep compiler happy.
    },

    /* ===================
       NORMAL USER ACTIONS
       =================== */
    /**
     * USER SIGN-UP
     *   Custom sign up action (overrides the blueprint create action).
     *   It creates a user record on the database.
     *
     * + URL: /user/signup/
     * + Method: POST
     * + URL Params: None
     * + Data Params: {fistName: string,
     *                 lastName: string,
     *                 userName: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content: {firstName: string,
     *                 lastName: string,
     *                 userName: string,
     *                 deleted: boolean,
     *                 banned: boolean,
     *                 admin: boolean,
     *                 createdAt: string,
     *                 updatedAt: string,
     *                 id: string}
     * + Error Response:
     *     - Code: 409
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    signup: function (req, res) {
	// Back-end validation of the different user attributes
	// firstName
	if (_.isUndefined(req.param('firstName')))
	    return res.badRequest('A first name is required');

	// lastName
	if (_.isUndefined(req.param('lastName')))
	    return res.badRequest('A last name is required');

	// userName
	if (_.isUndefined(req.param('userName')))
	    return res.badRequest('A user name is required');

	if (!_.isString(req.param('userName')) || req.param('userName').match(/[^a-z0-9]/i))
	    return res.badRequest('Invalid username: must consist of numbers and letters only.');

	// password
	if (_.isUndefined(req.param('password')))
	    return res.badRequest('A password is required');

	if (req.param('password').length < 6)
	    return res.badRequest('Password must be at least 6 characters');

	// Password encryption using a promise and sends data to DB or fail misserably.
	var passEncryption = new Promise(function(resolve, reject) {
	    bcrypt.hash(req.param('password'), 10, function(err, hash) {
		if (err)
		    return reject(err);

		resolve(hash);
		return null; // To keep compiler happy
	    });
	});

	passEncryption.then(function(hash) {
	    // Promise has been successful
	    var options = {
		firstName: req.param('firstName'),
		lastName: req.param('lastName'),
		userName: req.param('userName'),
		encryptedPassword: hash,
		deleted: false,
		banned: false,
		admin: false
	    };
	    // Therefore, it sends data to Mongo DB
	    User.create(options).exec(function(err, createdUser) {
		if (err){
		    // Manage the errors from Mongo DB.
		    if (err.invalidAttributes &&                               //  \
			err.invalidAttributes.userName &&                      //  | <---- Seriously??? WTH!!!
			err.invalidAttributes.userName[0] &&                   //  |
			err.invalidAttributes.userName[0].rule === 'unique') { //  /
			// This response is wrapped in a custom response defined in ~/api/responses/alreadyInUse.js
			/*return res.send(409, 'Username is already taken by another user. Please try again.');
			 }
			 return res.negotiate(err);*/
			return res.alreadyInUse(err); // this is equivalent to the previous two lines.
		    }
		};
		return res.json(createdUser);
	    });
	}, function(err){
	    // Promise failed, therefeore it fails misserably
	    return res.status(500).send('Bcrypt error.');
	});
	return null; // To keep compiler happy.
    },

    /**
     * RETRIEVE ONE USER PROFILE
     *   Custom retrieve profile action (overrides the blueprint findOne action).
     *   It retrieves an specific user record from the database.
     *
     * + URL: /user/profile/:id
     * + Method: GET
     * + URL Params: Required
     *               id=string
     * + Data Params :None
     * + Success Response:
     *     - Code: 200
     *     - Content: {firstName: string,
     *                 lastName: string,
     *                 userName: string,
     *                 deleted: boolean,
     *                 banned: boolean,
     *                 admin: boolean,
     *                 id: string}
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    profile: function(req, res) {
	User.findOne(req.param('id')).exec(function foundUser(err, user) {
	    if (err)
		return res.negotiate(err);
	    if (!user)
		return res.notFound();
	    var options = {
		firstName: user.firstName,
		lastName: user.lastName,
		userName: user.userName,
		deleted: user.deleted,
		admin: user.admin,
		banned: user.banned,
		id: user.id
	    };
	    return res.json(options);
	});
    },

    /**
     * DELETE USER PROFILE
     *   Custom delete profile action (overrides the blueprint destroy action).
     *   It deletes an specific user record from the database.
     *
     * + URL: /user/:id
     * + Method: DELETE
     * + URL Params: Required
     *               id=string
     * + Data Params :None
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    delete: function(req, res) {
	console.log('In UserController.delete');
	if (!req.param('id'))
	    return res.badRequest('id is a required parameter.');

	User.destroy({
	    id: req.param('id')
	}).exec(function (err, usersDestroyed){
	    if (err)
		return res.negotiate(err);
	    if (usersDestroyed.length === 0)
		return res.notFound();
	    return res.ok();
	});
	return null; // To keep compiler happy
    },

    /**
     * SOFT DELETE USER PROFILE
     *   Soft-delete profile action (overrides the blueprint update action).
     *   It updates the deleted attribute to 'true' for a particular user.
     *
     * + URL: /user/:id
     * + Method: DELETE
     * + URL Params: Required
     *               id=string
     * + Data Params :None
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    removeProfile: function(req, res){
	console.log('In UserController.removeProfile');
	if (!req.param('id'))
	    return res.badRequest('id is a required parameter.');

	User.update({
	    id: req.param('id')
	},{
	    banned: true
	}, function (err, removedUser){
	    if (err)
		return res.negotiate(err);
	    if (removedUser.length === 0)
		return res.notFound();
	    return res.send(200,removedUser);
	});
	return null; // To keep compiler happy
    },

    /**
     * RESTORE SOFT-DELETED USER PROFILE
     *   Restore soft deleted profile action (overrides the blueprint update action).
     *   It updates the deleted attribute to 'false' for a particular user.
     *
     * + URL: /user/restoreProfile
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {userName: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    restoreProfile: function(req, res){
	User.findOne({userName: req.param('userName')}, function foundUser(err, user){
	    if (err)
		return res.negotiate(err);
	    if (!user)
		return res.notFound();

	    bcrypt.compare(req.param('password'), user.encryptedPassword, function (err, match) {
		if (err)
		    return res.negotiate(err);
		if (!match)
		    return res.notFound();
		User.update({
		    id: user.id
		}, {
		    deleted: false
		}, function (err, updatedUser){
		    return res.json(updatedUser);
		});

		return null; // To keep compiler happy
	    });

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE USER PROFILE
     *   It updates the profile of a particular user.
     *
     * + URL: /user/updateProfile
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 firstName: string,
     *                 lastName: string,
     *                 userName: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    updateProfile: function(req, res) {
	User.update({
	    id: req.param('id')
	}, {
	    firstName: req.param('firstName'),
	    lastName: req.param('lastName')
	}, function (err, updatedUser) {
	    if (err)
		return res.negotiate(err);

	    return res.json(updatedUser);
	});
    },

    /**
     * CHANGE USER PASSWORD
     *   It changes the password of a particular user.
     *
     * + URL: /user/changePassword
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 password: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    changePassword: function(req, res) {
	if (_.isUndefined(req.param('password')))
	    return res.badRequest('A password is required.');
	if (req.param('password').length < 6)
	    return res.badRequest('Pasword must be at least 6 characters long.');

	// Encrypt password as before
	new Promise(function(resolve, reject) {
	    bcrypt.hash(req.param('password'), 10, function(err, hash) {
		if (err)
		    return reject(err);

		resolve(hash);

		return null; // To keep compiler happy
	    });
	}).then(function(hash) {
	    // Promise has been successful Therefore, it sends data to Mongo DB
	    User.update({id: req.param('id')}, {encryptedPassword: hash}).exec(function(err, updatedUser) {
		if (err)
		    return res.negotiate(err);
		return res.json(updatedUser);
	    });
	}, function(err){
	    // Promise failed, therefeore it fails misserably
	    return res.status(500).send('Bcrypt error.');
	});

	return null; // To keep compiler happy
    },

    /* ==================
       ADMIN USER ACTIONS
       ================== */
    /**
     * ADMIN USERS
     *   Lists all the users in the database.
     *
     * + URL: /user/adminUsers
     * + Method: GET
     * + URL Params: None
     * + Data Params: None
     * + Success Response:
     *     - Code: 200
     *     - Content: [JSON]
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    adminUsers: function(req, res) {
	User.find().exec(function(err, users){
	    if (err)
		return res.negotiate(err);

	    return res.json(users);
	});
    },

    /**
     * UPDATE ADMIN FLAG
     *   It changes the admin attribute for a particular user.
     *
     * + URL: /user/updateAdmin
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 admin: boolean}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    updateAdmin: function (req, res) {
	User.update(req.param('id'), {
	    admin:req.param('admin')
	}).exec(function(err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok();

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE BANNED FLAG
     *   It changes the banned attribute for a particular user.
     *
     * + URL: /user/updateBanned
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 banned: boolean}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    updateBanned: function (req, res) {
	User.update(req.param('id'), {
	    admin:req.param('banned')
	}).exec(function(err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok();

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE DELETED FLAG
     *   It changes the deleted attribute for a particular user.
     *
     * + URL: /user/updateDeleted
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 deleted: boolean}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 500
     *     - Content: string
     */
    updateDeleted: function (req, res) {
	User.update(req.param('id'), {
	    admin:req.param('deleted')
	}).exec(function(err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok();

	    return null; // To keep compiler happy
	});
    }
};
