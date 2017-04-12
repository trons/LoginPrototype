/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  connection: 'localMongodb', // <---- This must match the name on connections.js

  //migrate: 'drop', // <---- This will drop any existing schema on the server restart

  attributes: {
      firstName: {
	  type: 'string'
      },
      lastName: {
	  type: 'string'
      },
      userName: {
	  type: 'string',
	  required: 'true', // <---- Forces the attribute to be there
	  unique: 'true'    // <---- Forces the attribute to be unique (unique validation)
      },
      email:{
	  type: 'string',
	  required: 'true',
	  unique: 'true'
      },
      encryptedPassword: {
	  type: 'string'
      },
      admin: {
	  type: 'boolean',
	  defaultsTo: 'false' // <---- Sets the default value to 'false'
      },
      deleted: {
	  type: 'boolean',
	  defaultsTo: 'false'
      },
      banned: {
	  type: 'boolean',
	  defaultsTo: 'false'
      },
      verified: {
	  type: 'boolean',
	  defaultsTo: 'false'
      },
      toJSON: function() { // <---- Overrides toJSON method in the model so blueprints don't return all attributes
	  var modelAttributes = this.toObject();
	  delete modelAttributes.password;
	  delete modelAttributes.confirmation;
	  delete modelAttributes.encryptedPassword;
	  return modelAttributes;
      }
  }
};
