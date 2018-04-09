'use strict';

const AWS = require('aws-sdk');
const config = require('../config.json');

const ses = new AWS.SES({apiVersion: '2010-12-01'});

const onAdminCreateUser = async event => {

};

const onSignUp = async event => {

};

const onAuthenticated = async event => {
  console.log(`User authenticated: User-Pool ${event.userPoolId}, UserId: ${event.userName}`);
  const { request } = event;
  const subject = 'KISKIS alert';
  const body = `A login to your KISKIS account was successful on ${new Date()}`;
  const Charset = 'UTF-8';
  const params = {
    Destination: {
      ToAddresses: [request.userAttributes.email]
    },
    Message: {
      Body: { Text: { Charset, Data: body }
      },
      Subject: { Charset, Data: subject }
    },
    ReplyToAddresses: [config.congito.from_email],
    Source: config.congito.from_email,
  };
  return ses.sendEmail(params).promise();
};

const handlers = {
  PreSignUp_AdminCreateUser: onAdminCreateUser,
  PreSignUp_SignUp: onSignUp,
  PostAuthentication_Authentication: onAuthenticated,
};

module.exports = async (event, context) => {
  if (!event || !event.triggerSource || !event.request) return Promise.reject('Unknown event format');

  let response;
  const handler = handlers[event.triggerSource];
  if (handler) {
    await handler(event);
  }
  return event;
};
