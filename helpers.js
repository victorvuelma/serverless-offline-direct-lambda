var AWS = require("aws-sdk");

const getPort = () => "3000";
const getRegion = () => "us-east-1";
const getNameOfServerless = () => "equips-app-api";
const getEnv = () => "dev";

AWS.config.region = getRegion();

const lambda = new AWS.Lambda({
  endpoint: `http://localhost:${getPort()}`
});

const buildLambdaName = nameOfHandler =>
  `${getNameOfServerless()}-${getEnv()}-${nameOfHandler}`;

module.exports.lambda = lambda;
module.exports.buildLambdaName = buildLambdaName;
