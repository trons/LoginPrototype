/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /****************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ****************************************************************************/

    /***************************************************************************
     * JSON API                                                                *
     ***************************************************************************/
    // Custom REST Routes for user actions
    'PUT /login': 'UserController.login',
    'GET /logout': 'UserController.logout',

    'GET /user/admin-users': 'UserController.adminUsers',
    'GET /user/profile': 'UserController.profile',
    'GET /user/verify-profile': 'UserController.verifyProfile',

    // Reset password in one step
    'GET /user/reset-password': 'UserController.resetPassword',

    // Reset password in two steps
    'GET /user/request-reset-password': 'UserController.resetPasswordRequest',
    'GET /user/reset-password/:token': 'UserController.resetPasswordWithToken',

    'POST /user/signup': 'UserController.signup',
    'PUT /user/remove-profile': 'UserController.removeProfile',
    'PUT /user/restore-profile': 'UserController.restoreProfile',
    'PUT /user/update-profile': 'UserController.updateProfile',
    'PUT /user/change-password': 'UserController.changePassword',
    'PUT /user/update-admin/:id': 'UserController.updateAdmin',
    'PUT /user/update-banned/:id': 'UserController.updateBanned',
    'PUT /user/update-deleted/:id': 'UserController.updateDeleted',

    'DELETE /user/:id': 'UserController.delete',

    /***************************************************************************
     * Server-rendered HTML Pages                                              *
     * (Not quite, this is only to be consistent with the book example)        *
     ***************************************************************************/

    'GET /': {
	view: 'login'
    },

    'GET /signup': {
	view: 'signup'
    }

    
    
    /***************************************************************************
     *                                                                         *
     * Custom routes here...                                                   *
     *                                                                         *
     * If a request to a URL doesn't match any of the custom routes above, it  *
     * is matched against Sails route blueprints. See `config/blueprints.js`   *
     * for configuration options and examples.                                 *
     *                                                                         *
     ***************************************************************************/

};
