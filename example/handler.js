'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
let lambda = new AWS.Lambda({
	region: 'us-east-1',
	endpoint: 'http://localhost:3000'
});

module.exports.hello = (event, context, callback) => {
	console.log('In Lambda');
	callback(null, {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Go Serverless v1.0! Your function executed successfully!',
			input: event
		})
	});
};

module.exports.hasRoute = async (event, context) => {
	var lambda_args = {
		'some-key': 'some-value',
		'other-key': false
	};

	var params = {
		FunctionName: 'tyler-dev-myLambda', // the lambda function we are going to invoke
		Payload: JSON.stringify(lambda_args)
	};

	await lambda.invoke(params, function(err, data) {
		if (err) {
			console.error(err);
		}
		// console.dir(data);
	});
	return 'success';
};
