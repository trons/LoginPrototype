'use-strict';

module.exports = {
    generate: function (user) {
	return new Promise(function (resolve, reject){
	    //generate link
	    var token = JWTService.issueToken({user: user.userName}, // payload
					      undefined, // secret (undefined, so the service uses the default)
					      {algorithm: sails.config.jwtSettings.algorithm, // options
					       expiresIn: 1 * 60, // <---- Link expires in 15 minutes
					       issuer: sails.config.jwtSettings.issuer,
					       audience: sails.config.jwtSettings.audience});
	    
	    var link = 'http://localhost:1337/user/verify-profile?authorization=' + token +
	     '&username=' + user.userName +
	     '&firstname=' + user.firstName +
	     '&lastname=' + user.lastName +
	     '&email=' + user.email;
	    
	    // Send verification email
	    SendgridService.send({
		to: [{name: user.firstName + ' ' + user.lastName, email: user.email}],
		from: {name : 'admin', email : 'noreply@someservice.ml'},
		subject: 'Please verify your account',
		body: {text: '<H1>Verify your account</H1><br>' +
		       '<p>Click on this link to verify your account:<br>' +
		       link + '</p>',
		       format: 'html'}
	    }, function(err, data) {
		if (err)
		    return reject(err);
		return resolve('Sent verification link to the specified email account');
	    });
	});
    }
};
