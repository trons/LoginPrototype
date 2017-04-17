'use-strict';

/**
 * @fileoverview
 * This module manages the transactional emails sent automatic emails to those
 * users registered in the B2B application. It uses the sendgrid web-API v3.
 *
 * It is a wrapper to the sendgrid web-API v3 to send emails using the sendgrid
 * service.
 *
 * @module ./email.js
 * @export email
 * @author Mario Moro Hernández
 * @license None
 * @version 0.0.alpha
 * @requires fs.js
 * @requires sendgrid.js
 */

// fs library to read an attachment
var fs = require('fs');

// sendgrid library to send transactional emails using Sendgrid
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY || sails.config.sendgrid.apiKey);

// templates object to hold the ids of the transactional templates (if any).
// The format is {'Template_Name': 'Template_ID'[, ...]}
var templates = {};

// default from, body and subject fields to build the email object.
var defaults = {
    from : {name: 'sender email', email: 'noreply@mailservice.ml'},
    body: ' ',
    subject: ' '
};

module.exports = {
    // email methods
    /**
     * Sends a transactional email using sendgrid given a receiver and a template id.
     *
     * @param {object} data - object containing user's information.
     * @param {function} callback - callback function.
     */
    send : function (data, callback) {
	data = validateData(templates, defaults, data, callback);
	
	var request = sg.emptyRequest(
	    {
		method: 'POST',
		path: '/v3/mail/send',
		body: buildBody(data, templates)
	    });
	
	sg.API(request, function (error, response) {
	    if (error) {
		console.error('Status: ' + response.statusCode +
			      '\nResponse: ' + JSON.stringify(response, null, ' ') + 
			      '\nError stack:\n' + error.stack);
	    }
	    callback(error, response);
	});
    }
};

/* =================
   UTILITY FUNCTIONS
   ================= */
/**
 * <p>Builds the body JSON object required by the SendGrid API to build and send
 * the emails. If the data object includes a body attribute, then it  MUST include
 * a subject attribute as well.</p>
 *
 * <p> data is a JSON object with the following format:
 *   data = { 
 *            to : [{name : 'name', email : 'email}, ...],
 *            sub: {':field_in_template': 'substitution_string', ...},
 *            from : {name : 'name', email : 'email'},
 *            templateName : 'template_name' ||
 *            body: {text: 'HTML or plain-text body', format: 'html'|| 'plain'}
 *          }</p>
 *
 *
 * @param {object} data - object containing user's information.
 * @param {object} templates - object containing templates ids.
 * @return {object} - JSON object required by SendGrid API.
 */
function buildBody(data, templates) {
    var bodyJSON =  {
	personalizations: [
	    {
		to: data.to,
		subject: data.subject,
		substitutions: data.sub
	    }
	],
	from: data.from
    };
    
    if (data.body)
	bodyJSON.content = [
	    {
		type: 'text/' + (data.body.format || 'plain'),
		value: data.body.text
	    }
	];
    
    if (data.templateName) {
	bodyJSON.content = [
	    {
		type: 'text/html',
		value: data.body.text
	    }
	];
	bodyJSON.template_id = templates[data.templateName];
    }
    
    return bodyJSON;
}


/**
 * Checks the json object containing the necessary data to send a transactional
 * email.
 *
 * @param {object} templates - object containing the ids for the templates.
 * @param {object} defaults - object containing the default values if a matching
 *                            template is not found.
 * @param {object} data - object containing the required fields to build the
 *                        bodyJSON object required to generate the email.
 * @param {function} callback - callback function.
 * @return {object} - a sanitised object with the necessary information to send
 *                    an email with Sendgrid web API v3.
 */
function validateData(templates, defaults, data, callback) {
    if (!data.to) 
	if (callback) callback({error:'Receipt email address required'});
    
    if (!data.templateName && !data.body)
	if (callback) callback({error: 'Email template no specified, so body and subject are required'});
    
    if (data.hasOwnProperty('templateName') && !templates.hasOwnProperty(data.templateName))
	if (callback) callback({error: 'Invalid template name'});
    
    if (!data.from) data.from = defaults.from;
    
    if (!data.body) data.body = defaults.body;
    
    if (!data.subject) data.subject = defaults.subject;
    
    return data;
}


/**
 * Reads a file synchronously and transcode it into a base64 string. This is
 * useful to send attachments.
 * 
 * @param {string} file - full qualified path of the file.
 * @return {string} - a string with the file encoded in base64.
 */
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}
