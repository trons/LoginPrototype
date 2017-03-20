/**
 * Created by user on 13/11/2014.
 */


var Sails = require('sails');

before(function(done) {
    Sails.lift({
        // configuration for testing purposes
    }, function(err, sails) {
        if (err) return done(err);

        console.log("Bootstraping test data...");
        done();
    });
});

after(function(done) {
    // here you can clear fixtures, etc.
    sails.lower(done);
});
