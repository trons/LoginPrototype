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

	/*
	 This snippet of code is here for illustrative purposes only. It shows how to use a
	 function on this bootstrap function before lifting the sails server. In particular,
	 the code would search some videos on youtube (cf. Sails.js in Action Ch. 5).

	 It also shows the use of the ~/config/local.js configuration file (where ~ is the
	 root directory for the project). This is a local file that is used only in development
	 and is not included on the git repository.

	var Youtube = require('machinepack-youtube');
	
	// List Youtube videos with match the specivied search query.
	Youtube.searchVideos({query: 'grumpy cat',
			      // apiKey: 'PLACE YOUR GOOGLE API KEY HERE', // If API key IS NOT in config/local.js
			      apiKey: sails.config.google.apiKey // If API key IS in config/local.js
			      limit: 15}).exec({
				  // An unexpected error occurred.
				  error: function(err) {
				      console.log('ERROR : ', err);
				      return cb(err);
				  },
				  // OK
				  success: function (results) {
				      // This foreach loop follows the book example to clean the result obtained
				      _.each(results, function(result) {
					  result.src = 'https://www.youtube.com/embed/' + result.id;
					  delete result.description;
					  delete result.publishedAt;
					  delete result.id;
					  delete result.url;
				      });

				      // It creates a record (puts the 
				      User.create(results).exec(function (err, resultsCreated) {
					  if (err) {
					      console.log('ERROR: ', err);
					      return cb(err);
					  }

					  console.log('result: ', results);
					  return cb();
				      });
				  }
			      });
	 */	

	console.log('There are no user records.');
	return cb();
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    //cb();
};
