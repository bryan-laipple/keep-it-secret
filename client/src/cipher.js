'use strict'; // eslint-disable-line strict
const aes = require('crypto-js/aes');
const utf8 = require('crypto-js/enc-utf8');

const encryptV1 = (data, secret) => {
  const meta = { version: 1 };
  const json = JSON.stringify(data);
  const val = aes.encrypt(json, secret);
  return { meta, data: val.toString() };
};

const decryptV1 = (meta, data, secret) => {
  try {
    const bytes = aes.decrypt(data, secret);
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
