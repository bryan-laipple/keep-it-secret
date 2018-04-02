import React, { Component } from 'react';

import SimpleSignIn from './SimpleSignIn';
import { encrypt, decrypt } from './cipher';
import get from 'lodash.get';

import {
  withAuthenticator,
  FormSection,
  SectionHeader,
  SectionBody,
  InputRow,
  ButtonRow,
  ActionRow,
  Button,
  Space,
} from 'aws-amplify-react';
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.inputs = {};

    this.state = {
      authState: props.authState,
      authData: props.authData,
      kiskis: {},
    };

    this.onDecrypt = this.onDecrypt.bind(this);
    this.onEncrypt = this.onEncrypt.bind(this);
    this.onSave = this.onSave.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    Auth.userAttributes(this.state.authData)
      .then(Auth.attributesToObject)
      .then(({ kiskis: json }) => {
        const encrypted = json ? JSON.parse(json) : {};
        this.setState({ kiskis: { encrypted } });
      })
  }

  handleInputChange(evt) {
    this.inputs = this.inputs || {};
    const { name, value, type, checked } = evt.target;
    const check_type = ['radio', 'checkbox'].includes(type);
    this.inputs[name] = check_type? checked : value;
  }

  onDecrypt() {
    const secret = get(this, 'inputs.secret');
    if (secret) {
      const {encrypted} = get(this, 'state.kiskis', {});
      const decrypted = decrypt(encrypted, secret);
      this.setState({kiskis: {encrypted, decrypted}});
    }
  }

  onEncrypt() {
    const secret = get(this, 'inputs.secret');
    const decrypted = get(this, 'inputs.decrypted');
    if (secret && decrypted) {
      const encrypted = encrypt(decrypted, secret);
      this.setState({kiskis: {encrypted, decrypted}});
    }
  }

  onSave() {
    const {encrypted} = get(this, 'state.kiskis', {});
    if (encrypted) {
      // TODO debug kiskis not attribute on schema?
      const kiskis = JSON.stringify(encrypted);
      Auth.updateUserAttributes(this.state.authData, { kiskis });
    }
  }

  render() {
    const {encrypted, decrypted} = get(this, 'state.kiskis', {});
    // TODO UI
    return (
      <FormSection>
        <SectionHeader>Secret & Safe</SectionHeader>
        <SectionBody>
          <InputRow
            autoFocus
            placeholder="secret key"
            key="secret"
            type="password"
            name="secret"
            onChange={this.handleInputChange}
          />
          <InputRow
            placeholder={encrypted ? JSON.stringify(encrypted) : 'encrypted value'}
            key="encrypted"
            name="encrypted"
          />
          <InputRow
            placeholder={decrypted || 'decrypted value'}
            key="decrypted"
            name="decrypted"
            onChange={this.handleInputChange}
          />
          <ActionRow>
            <Button onClick={this.onDecrypt}>
              Decrypt
            </Button>
            <Space />
            <Button onClick={this.onEncrypt}>
              Encrypt
            </Button>
            <Space />
            <Button onClick={this.onSave}>
              Save
            </Button>
          </ActionRow>
        </SectionBody>
      </FormSection>
    );
  }
}

export default withAuthenticator(App, true, [<SimpleSignIn/>]);
