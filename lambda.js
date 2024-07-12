const serverless = require('serverless-http');
const app = require('./index');
const { logger } = require('./logging');

module.exports.handler = serverless(app, {
  request: function (request, event, context) {
    process.env.DEBUG && logger.info('Request:', request);
  },
  response: function (response, event, context) {
    process.env.DEBUG && logger.info('Response:', response);
  },
  binary: ['image/*'],
});
