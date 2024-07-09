const serverless = require('serverless-http');
const app = require('./index');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  console.log('Event:', event);
  console.log('Context:', context);

  const response = await handler(event, context);

  console.log('Response:', response);

  return response;
};
