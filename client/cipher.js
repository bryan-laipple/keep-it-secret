'use strict';
const sha256 = require('crypto-js/sha256');
const aes = require('crypto-js/aes');
const utf8 = require('crypto-js/enc-utf8');

const encryptV1 = (data, secret) => {
  const meta = { version: 1, hash: 'sha256' };
  const json = JSON.stringify(data);
  const val = aes.encrypt(json, sha256(secret).toString());
  return { meta, data: val.toString() };
};

const decryptV1 = (meta, data, secret) => {
  if (meta.hash !== 'sha256') {
    return {};
  }

  try {
    const bytes = aes.decrypt(data, sha256(secret).toString());
    const json = bytes.toString(utf8);
    return JSON.parse(json);
  } catch (err) {
    return {};
  }
};

const encrypt = (data, secret) => {
  return encryptV1(data, secret);
};

const decrypt = ({ meta, data }, secret) => {
  if (meta && meta.version === 1) {
    return decryptV1(meta, data, secret);
  }

  return {};
};

module.exports = {
  encrypt,
  decrypt
};
