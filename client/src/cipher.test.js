'use strict';
const { encrypt, decrypt } = require('./cipher');
const should = require('chai').should();

describe('cipher', function() {
  const originalData = { fieldA: 'A', fieldB: 'bee', field1: 1 };
  describe('encrypt', function() {
    it('should encrypt an object', function() {
      const encrypted = encrypt(originalData, 'supersecret');
      encrypted.should.have.property('data');
      encrypted.should.have.property('meta');
      encrypted.meta.should.have.keys({ version: 1 });
      encrypted.data.should.be.a('string');
    });
    it('should encrypt a string', function() {
      const encrypted = encrypt('some string', 'supersecret');
      encrypted.should.have.property('data');
      encrypted.should.have.property('meta');
      encrypted.meta.should.have.keys({ version: 1 });
      encrypted.data.should.be.a('string');
    });
  });
  describe('decrypt', function() {
    let encrypted;
    const secret = 'superduper-secret123';
    beforeAll(function() {
      encrypted = encrypt(originalData, secret);
    });
    it('should decrypt a string for correct secret', function() {
      const str = 'some string';
      const encryptedStr = encrypt(str, secret);
      const decrypted = decrypt(encryptedStr, secret);
      decrypted.should.deep.equal(str);
    });
    it('should decrypt an object for correct secret', function() {
      const decrypted = decrypt(encrypted, secret);
      decrypted.should.deep.equal(originalData);
    });
    it('should return empty object for incorrect secret', function() {
      const decrypted = decrypt(encrypted, 'not-the' + secret);
      decrypted.should.deep.equal({});
    });
    it('should return empty object for no meta', function() {
      const { meta, ...sansMeta } = encrypted;
      const decrypted = decrypt(sansMeta, secret);
      decrypted.should.deep.equal({});
    });
    it('should return empty object for unknown version', function() {
      const meta = { ...encrypted.meta, version: 0 };
      const decrypted = decrypt({ ...encrypted, meta }, secret);
      decrypted.should.deep.equal({});
    });
  });
});
