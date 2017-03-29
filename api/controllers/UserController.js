'use-strict';
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/* ======
   IMPORT
   ====== */
var passport = require('passport');

/* ======
   EXPORT
   ====== */
module.exports = {
    /* ======================
       AUTHENTICATION ACTIONS
       ====================== */
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
    login: function (req, res, next){
	passport.authenticate('local', function (err, user, response){
	    if (err)
		return res.negotiate(err);
	    if (user)
		return res.json(user);
	    if (!user){
		switch(response.message){
		case 'user_not_found':
		    return res.notFound('The username you entered is unknown.');
		case 'wrong_password':
		    return res.notFound('The password you entered is wrong.');
		case 'deleted':
		    return res.forbidden('Your account has been deleted. Please restore your account.');
		case 'banned':
		    return res.forbidden('Your account has been banned.');
		default:
		    return res.serverError('Something went wrong.');
		}
	    }
	    return res.badRequest('The request was malformed.');
	})(req, res, next);
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
	delete req.logout();
	return res.redirect('/');
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
     *     - Code: 403
     *     - Content: string
     *     OR 
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

	// Password encryption using a promise and sends data to DB or fail miserably.
	var passEncryption = PasswordsService.encrypt(req.param('password'));

	passEncryption.then(function (hash) {
	    // Promise has been successful
	    var options = {
		firstName: req.param('firstName'),
		lastName: req.param('lastName'),
		userName: req.param('userName'),
		encryptedPassword: hash
		// admin, deleted, and banned attributes are set to false by default (cf. ~/api/models/User.js)
	    };
	    // Therefore, it sends data to Mongo DB
	    User.create(options).exec(function (err, createdUser) {
		if (err){
		    // Manage the errors from Mongo DB.
		    if (err.invalidAttributes &&
			err.invalidAttributes.userName &&
			err.invalidAttributes.userName[0] &&
			err.invalidAttributes.userName[0].rule === 'unique') {
			// This uses the response defined in ~/api/responses/alreadyInUse.js
			return res.alreadyInUse(err);
		    }
		};

		// Authenticates the user (Passport)
		passport.authenticate('local', function (err, user, response){
		    if (err)
			return res.negotiate(err);
		    if (user && response.message === 'logged_in')
			return res.json(user);
		    return res.serverError('Something went wrong.');
		})(req, res);

		return null; // To keep compiler happy
	    });
	}).catch(function (err) {
	    // Promise failed. Therefeore, it fails miserably
	    return res.negotiate(err);
	});
	return null; // To keep compiler happy.
    },
			   

    /**
     * RETRIEVE ONE USER PROFILE
     *   Custom retrieve profile action (overrides the blueprint findOne action).
     *   It retrieves an specific user record from the database.
     *
     * + URL: /user/profile/
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    profile: function (req, res) {
	User.findOne(req.session.passport.user).exec(function foundUser(err, user) {
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    delete: function (req, res) {
	if (!req.param('id'))
	    return res.badRequest('id is a required parameter.');

	User.destroy({
	    id: req.param('id')
	}).exec(function (err, userDestroyed){
	    if (err)
		return res.negotiate(err);
	    if (userDestroyed.length === 0)
		return res.notFound();
	    return res.json(userDestroyed);
	});
	return null; // To keep compiler happy
    },

    /**
     * SOFT DELETE USER PROFILE
     *   Soft-delete profile action (overrides the blueprint update action).
     *   It updates the deleted attribute to 'true' for a particular user.
     *
     * + URL: /remove-profile/
     * + Method: DELETE
     * + URL Params: None
     * + Data Params: None
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    removeProfile: function (req, res){
	User.update({
	    id: req.session.passport.user
	},{
	    deleted: true
	}, function (err, removedUser){
	    if (err)
		return res.negotiate(err);
	    if (removedUser.length === 0)
		return res.notFound();
	    // Removes the user session.
	    delete req.logout();
	    return res.json(removedUser);
	});

	return null; // To keep compiler happy
    },

    /**
     * RESTORE SOFT-DELETED USER PROFILE
     *   Restore soft deleted profile action (overrides the blueprint update action).
     *   It updates the deleted attribute to 'false' for a particular user.
     *
     * + URL: /user/restore-profile
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    restoreProfile: function (req, res) {
	User.findOne({userName: req.param('userName')}).exec(function foundUser(err, user) {
	    if (err)
		return res.negotiate(err);
	    if (!user)
		return res.notFound();

	    var checkPassword = PasswordsService.compare(req.param('password'), user.encryptedPassword);
	    
	    checkPassword.then(function (match) {
		// Promise was successful
		if (!match){
		    return res.notFound();
		}
		
		User.update({id: user.id}, {deleted: false}, function (err, updatedUser) {
		    if (err)
			return res.negotiate(err);

		    // Authenticates the user.
		    req.session.passport.user = user.id;
		    passport.authenticate('local', function (err, user, response){
			if (err)
			    return res.negotiate(err);
			if (user && response.message === 'logged_in')
			    return res.json(user);
			return res.serverError('Something went wrong.');
		    })(req, res);

		    return null; // To keep compiler happy
		});
		return null; // To keep compiler happy
	    }).catch(function (err) {
		// Promise failed. Therefeore, it fails miserably.
		return res.negotiate(err);
	    });

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE USER PROFILE
     *   It updates the profile of a particular user.
     *
     * + URL: /user/update-profile
     * + Method: PUT
     * + URL Params: None
     * + Data Params: {id: string,
     *                 firstName: string,
     *                 lastName: string}
     * + Success Response:
     *     - Code: 200
     *     - Content:
     * + Error Response:
     *     - Code: 400
     *     - Content: string
     *     OR
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    updateProfile: function (req, res) {
	User.update({
	    id: req.session.passport.user
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
     * + URL: /user/change-password
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    changePassword: function (req, res) {
	if (_.isUndefined(req.param('password')))
	    return res.badRequest('A password is required.');

	if (req.param('password').length < 6)
	    return res.badRequest('Pasword must be at least 6 characters long.');

	// Encrypt password as before
	var encPassword = PasswordsService(req.param('password'));

	encPassword.then(function (hash) {
	    // Promise has been successful. Therefore, it sends data to Mongo DB
	    User.update({
		id: req.session.passport.user
	    },{
		encryptedPassword: hash
	    }).exec(function (err, updatedUser) {
		if (err)
		    return res.negotiate(err);
		return res.json(updatedUser);
	    });
	}).catch(function (err){
	    // Promise failed. Therefeore, it fails miserably
	    return res.negotiate(err);
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
     * + URL: /user/admin-users
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    adminUsers: function (req, res) {
	User.find().exec(function (err, users){
	    if (err)
		return res.negotiate(err);

	    return res.json(users);
	});
    },

    /**
     * UPDATE ADMIN FLAG
     *   It changes the admin attribute for a particular user.
     *
     * + URL: /user/update-admin
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
     *     - Code: 403
     *     - Content: string
     *     OR 
     *     - Code: 500
     *     - Content: string
     */
    updateAdmin: function (req, res) {
	User.update(req.param('id'), {
	    admin:req.param('admin')
	}).exec(function (err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok('OK');

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE BANNED FLAG
     *   It changes the banned attribute for a particular user.
     *
     * + URL: /user/update-banned
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
	    banned: req.param('banned')
	}).exec(function (err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok('OK');

	    return null; // To keep compiler happy
	});
    },

    /**
     * UPDATE DELETED FLAG
     *   It changes the deleted attribute for a particular user.
     *
     * + URL: /user/update-deleted
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
	    deleted: req.param('deleted')
	}).exec(function (err, update){
	    if (err)
		return res.negotiate(err);
	    res.ok('OK');

	    return null; // To keep compiler happy
	});
    }
};
