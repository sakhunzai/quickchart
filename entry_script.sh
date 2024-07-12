#!/bin/sh
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/local/bin/aws-lambda-rie /usr/local/bin/npx aws-lambda-ric ${AWS_LAMBDA_EXEC_HANDLER}
else
  exec /usr/local/bin/npx aws-lambda-ric ${AWS_LAMBDA_EXEC_HANDLER}
fi