var AWS = require("aws-sdk");

const getPort = () => "3000";
const getRegion = () => "us-east-1";

AWS.config.region = getRegion();

const lambda = new AWS.Lambda({
  endpoint: `http://localhost:${getPort()}`
});

module.exports.lambda = lambda;
