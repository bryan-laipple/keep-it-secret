import get from 'lodash.get';
import config from './config.json';

import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

const CUSTOM_ATTR = get(config, 'custom_attribute.name');
const MAX_LENGTH = get(config, 'custom_attribute.max_length');

export const chunkString = (str, chuckSize) => {
  if (str.length <= chuckSize) {
    return [str];
  }
  const size = Math.ceil(str.length / chuckSize);
  const ret  = new Array(size);
  let offset = 0;

  for(let i = 0; i < size; ++i, offset += chuckSize) {
    ret[i] = str.substring(offset, offset + chuckSize);
  }

  return ret;
};

export const fetchData = async ({ authData }) =>
  Auth.userAttributes(authData)
    .then(Auth.attributesToObject)
    .then(({ [CUSTOM_ATTR]: json }) => json ? JSON.parse(json) : {});

export const saveData = async ({ authData, encrypted }) => {
  if (encrypted) {
    const val = JSON.stringify(encrypted);
    if (val.length > MAX_LENGTH) {
      return { status: 'error', text: 'Data exceeds size limit and cannot be saved' };
    }
    try {
      await Auth.updateUserAttributes(authData, {[CUSTOM_ATTR]: val});
      return { status: 'success', text: 'Succeeded in securely saving data' };
    } catch (err) {
      console.error(err.message || err);
      return { status: 'error', text: 'An error occurred attempting to securely save data' };
    }
  }
  return {};
};
