# serverless-offline-lambda-to-lambda

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm](https://img.shields.io/npm/v/serverless-offline-lambda-to-lambda.svg)](https://www.npmjs.com/package/serverless-offline-lambda-to-lambda)
[![npm](https://img.shields.io/npm/dt/serverless-offline-lambda-to-lambda.svg)](https://www.npmjs.com/package/serverless-offline-lambda-to-lambda)

A Serverless Offline plugin that exposes lambdas with no API Gateway event via HTTP, to allow offline direct lambda-to-lambda interactions.

Note - this requires the plugin 'serverless-offline'.

## Installation

Go to your project directory and install the plugin by running :

for npm users

```bash
npm install -D serverless-offline-lambda-to-lambda
```

for yarn users

```bash
yarn add serverless-offline-lambda-to-lambda -D
```

## Setup

Open your `serverless.yml` configuration file and

- add a `plugins` section
- add `serverless-functions-base-path` plugin

```
plugins:
- serverless-offline-lambda-support
```

You may also want to change the port that the plugin runs on - you can do this by specifying the following custom config in your `serverless.yml` file:

```yml
custom:
  serverless-offline:
    port: 4000
```

## Running & Calling

To run:

```
servlerless offline start
```

The plugin will create api-gateway proxies for all lambdas.

You will see output like this:

```bash
sls offline start

Serverless: Running Serverless Offline with direct lambda support
Serverless: Starting Offline: dev/us-east-1.

Serverless: Routes for myLambda:
Serverless: (none)

Serverless: Routes for my-project-dev-myLambda_proxy:
Serverless: POST /proxy/my-project-dev-myLambda
Serverless: POST /2015-03-31/functions/my-project-dev-myLambda/invocations
```

### Calling via HTTP Post:

The body of the POST should match the JSON data that would ordinarily be passed in a lambda-to-lambda call. i.e.

```bash
curl -X POST \
  http://localhost:4000/proxy/my-project-dev-myLambda \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
    "some-key": "some-value",
    "other-key": false
}'
```

### Invoking the function via the AWS SDK:

You may also invoke the function by using the AWS SDK on your client side...
This can be done by specifying a custom "endpoint" in your Lambda configuration like so:

```javascript
var AWS = require("aws-sdk");
AWS.config.region = "us-east-1";

let lambda = new AWS.Lambda({
  region: "us-east-1",
  endpoint: "http://localhost:4000"
});

var lambda_args = {
  "some-key": "some-value",
  "other-key": false
};

var params = {
  FunctionName: "my-project-dev-myLambda", // the lambda function we are going to invoke
  Payload: JSON.stringify(lambda_args)
};

lambda.invoke(params, function(err, data) {
  if (err) {
    console.error(err);
  } else {
    console.dir(data);
  }
});
```
