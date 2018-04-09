'use strict';

const get = require('lodash.get');

const { responseBody } = require('../defaults');
const config = require('../config.json');

const responseHeaders = headers => {
  headers = headers || {};

  headers['cache-control'] = [{
    key: 'Cache-Control',
    value: 'max-age=100'
  }];
  headers['content-type'] = [{
    key: 'Content-Type',
    value: 'text/html'
  }];
  headers['content-encoding'] = [{
    key: 'Content-Encoding',
    value: 'UTF-8'
  }];
  return headers;
};

const secureHeaders = headers => {
  headers = headers || {};
  headers['strict-transport-security'] = [{
    key:   'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubdomains; preload'
  }];

  headers['content-security-policy'] = [{
    key:   'Content-Security-Policy',
    value: "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; object-src 'none'"
  }];

  headers['x-content-type-options'] = [{
    key:   'X-Content-Type-Options',
    value: 'nosniff'
  }];

  headers['x-frame-options'] = [{
    key:   'X-Frame-Options',
    value: 'DENY'
  }];

  headers['x-xss-protection'] = [{
    key:   'X-XSS-Protection',
    value: '1; mode=block'
  }];

  headers['referrer-policy'] = [{
    key:   'Referrer-Policy',
    value: 'same-origin'
  }];
  return headers;
};

const allowed = req => config.allowed.find(a => a === req.uri);

const invalid = (req, {path, expected}) => {
  let result = true;
  const val = get(req, path);
  if (val) {
    for (let i = 0; i < val.length; i++) {
      if (val[i].value.indexOf(expected) >= 0) {
        result = false;
        break;
      }
    }
  }
  return result;
};

const denied = req => config.validations.find(v => invalid(req, v));

const shouldBlock = req => !allowed(req) && denied(req);

const onViewerRequest = async (event, context) => {
  const { request } = event.Records[0].cf;
  let result = request;
  if (shouldBlock(request)) {
    result = {
      status: '200',
      statusDescription: 'OK',
      headers: responseHeaders(secureHeaders()),
      body: responseBody
    };
  }
  return result;
};

const onViewerResponse = async (event, context) => {
  const { response } = event.Records[0].cf;
  const { headers } = response;
  secureHeaders(headers);
  headers['content-security-policy'] = [{
    key: 'Content-Security-Policy',
    value: "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self' https://cognito-idp.us-west-2.amazonaws.com https://cognito-identity.us-west-2.amazonaws.com; object-src 'none'"
  }];
  return response;
};

module.exports = {
  onViewerRequest,
  onViewerResponse,
};
