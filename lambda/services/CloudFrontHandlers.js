'use strict';

const get = require('lodash.get');

const { responseBody } = require('../defaults');
const config = require('../config.json');

const secureHeaders = headers => {
  headers = headers || {};
  headers['strict-transport-security'] = [{
    key:   'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubdomains; preload'
  }];

  headers['content-security-policy'] = [{
    key:   'Content-Security-Policy',
    value: "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"
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

const restricted = req => config.allowed.find(a => a !== req.uri);

const invalid = (req, {path, expected}) => get(req, path) !== process.env[expected];

const denied = req => config.validations.find(v => invalid(req, v));

const shouldBlock = req => restricted(req) && denied(req);

const onViewerRequest = (event, context) => {
  const { request } = event.Records[0].cf;
  let result = request;
  if (shouldBlock(request)) {
    result = {
      status: 200,
      headers: secureHeaders(),
      bodyEncoding: 'text',
      body: responseBody,
    };
  }
  return result;
};

const onViewerResponse = (event, context) => {
  const { response } = event.Records[0].cf;
  const { headers } = response;
  secureHeaders(headers);
  return response;
};

module.exports = {
  onViewerRequest,
  onViewerResponse,
};
