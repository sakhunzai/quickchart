 
FROM node:20.15.1-bookworm-slim as build-image

ENV NODE_ENV production
ENV AWS_LAMBDA_EXEC_HANDLER=lambda.handler

WORKDIR /var/task

RUN apt update \
    && apt install -y curl build-essential g++ \
    libcairo2-dev libpango1.0-dev libjpeg-dev librsvg2-dev libimagequant-dev libvips-dev libssl-dev graphviz cmake make 
   
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie-arm64  /usr/local/bin/aws-lambda-rie
RUN chmod +x /usr/local/bin/aws-lambda-rie

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install production dependencies
RUN yarn install --production

RUN yarn add aws-lambda-ric --production

# Copy the rest of the application code
COPY *.js ./
COPY lib/*.js lib/
COPY LICENSE .



FROM node:20.15.1-bookworm-slim

ENV NODE_ENV production
ENV AWS_LAMBDA_EXEC_HANDLER=lambda.handler

WORKDIR /var/task

RUN apt update \
    && apt install -y libcairo2-dev libpango1.0-dev libjpeg-dev librsvg2-dev libimagequant-dev libvips-dev libssl-dev libmount-dev \
        fonts-dejavu fonts-droid-fallback fonts-freefont-ttf fonts-liberation fonts-noto-core fonts-noto-color-emoji fontconfig \
        graphviz \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build-image /usr/local/bin/aws-lambda-rie /usr/local/bin/aws-lambda-rie
COPY --from=build-image /var/task /var/task
COPY entry_script.sh .

ENTRYPOINT ["./entry_script.sh"]

# # Set the command to run the Lambda function with Express.js
CMD ["lambda.handler"]
 