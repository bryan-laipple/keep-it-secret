import React, { Component } from 'react';
import { encrypt, decrypt } from './cipher';

const secret = 'super-silly-secret';
class Cryptr extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { input: '', encrypted: '', decrypted: '' };
  }
  handleInput(e) {
    this.setState({ input: e.target.value })
  }
  handleUpdate() {
    const encrypted = encrypt(this.state.input, secret);
    const decrypted = decrypt(encrypted, secret);
    this.setState({ input: '', encrypted: JSON.stringify(encrypted, null, 2), decrypted})
  }
  render() {
    return (
      <div>
        <input type="text"
               value={this.state.input}
               onChange={e => this.handleInput(e)}/>
        <button onClick={() => this.handleUpdate()}>Update</button>
        <div>Encrypted: {this.state.encrypted}</div>
        <div>Decrypted: {this.state.decrypted}</div>
      </div>
    )
  }
}

export default Cryptr;
