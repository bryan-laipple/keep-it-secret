import React, { Component } from 'react';

import SimpleSignIn from './SimpleSignIn';
import { encrypt, decrypt } from './cipher';
import get from 'lodash.get';

import {
  Button,
  ButtonGroup,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Panel
} from 'react-bootstrap';

import { withAuthenticator } from 'aws-amplify-react';
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';
import config from './config.json';

Amplify.configure(aws_exports);

const CUSTOM_ATTR = get(config, 'custom_attribute.name');
const MAX_LENGTH = get(config, 'custom_attribute.max_length');

const chunkString = (str, chuckSize) => {
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

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.secret = '';

    this.state = {
      authState: props.authState,
      authData: props.authData,
      encrypted: {},
      decrypted: '',
      secretProvided: false,
    };

    this.onDecrypt = this.onDecrypt.bind(this);
    this.onEncrypt = this.onEncrypt.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onKeyChange = this.onKeyChange.bind(this);
    this.onDataChange = this.onDataChange.bind(this);
  }

  componentDidMount() {
    Auth.userAttributes(this.state.authData)
      .then(Auth.attributesToObject)
      .then(({ [CUSTOM_ATTR]: json }) => {
        const encrypted = json ? JSON.parse(json) : {};
        this.setState({ encrypted });
      })
  }

  onKeyChange(e) {
    this.secret = e.target.value;
    this.setState({ secretProvided: !!this.secret });
  }

  onDataChange(e) {
    const { value: decrypted } = e.target;
    this.setState({ decrypted });
  }

  onDecrypt() {
    const { encrypted } = this.state;
    if (this.secret && encrypted) {
      const decrypted = decrypt(encrypted, this.secret);
      if (decrypted) {
        this.setState({ decrypted });
      } else {
        this.setFeedback({
          status: 'error',
          text: 'Failed to decrypt data'
        })
      }
    }
  }

  onEncrypt() {
    const { decrypted } = this.state;
    if (this.secret && decrypted) {
      const encrypted = encrypt(decrypted, this.secret);
      this.setState({ encrypted });
    }
  }

  setFeedback({ status, text }) {
    this.setState({feedback: {status, text}});
    setTimeout(() => this.setState({feedback: null}), 5000);
  }

  onSave() {
    const { encrypted } = this.state;
    if (encrypted) {
      const val = JSON.stringify(encrypted);
      if (val.length > MAX_LENGTH) {
        this.setFeedback({
          status: 'error',
          text: 'Data exceeds size limit and cannot be saved'
        });
      } else {
        Auth.updateUserAttributes(this.state.authData, {[CUSTOM_ATTR]: val})
          .then(() => {
            this.setFeedback({
              status: 'success',
              text: 'Succeeded in securely saving data'
            });
          })
          .catch(err => {
            console.error(err.message || err);
            this.setFeedback({
              status: 'error',
              text: 'An error occurred attempting to securely save data'
            });
          });
      }
    }
  }

  renderEncrypted() {
    const data = get(this, 'state.encrypted.data');
    const chunks = data ? chunkString(data, 64) : [];
    return (
      <pre className="encrypted">{chunks.map(str => `${str}\n`)}</pre>
    );
  }

  renderFeedback() {
    const { feedback } = this.state;
    let backgroundClass = '';
    let text = '';
    if (feedback) {
      backgroundClass = feedback.status === 'error' ? 'bg-danger' : 'bg-success';
      text = feedback.text;
    }
    return (
      <p className={`feedback ${backgroundClass}`}>
        {text}
      </p>
    );
  }

  render() {
    const { encrypted, decrypted, secretProvided } = this.state;
    const canDecrypt = secretProvided && encrypted;
    const canEncrypt = secretProvided && decrypted;
    const canSave = canEncrypt;
    return (
      <div className="app-wrapper">
        <Panel className="app-content" bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">Keep it Secret, Keep it Safe</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <Form inline>
              <FormGroup>
                <ControlLabel>Secret Key</ControlLabel>{' '}
                <FormControl
                  className="secret"
                  type="password"
                  placeholder="encryption key"
                  onChange={this.onKeyChange}
                />
              </FormGroup>
              <ButtonGroup className="buttons">
                <Button
                  disabled={!canDecrypt}
                  onClick={canDecrypt ? this.onDecrypt : null}
                >
                  Decrypt
                </Button>
                <Button
                  disabled={!canEncrypt}
                  onClick={canEncrypt ? this.onEncrypt : null}
                >
                  Encrypt
                </Button>
                <Button
                  disabled={!canSave}
                  onClick={canSave ? this.onSave : null}
                >
                  Save
                </Button>
              </ButtonGroup>
            </Form>
            {this.renderFeedback()}
            <form>
              <FormGroup>
                <ControlLabel>Encrypted</ControlLabel>
                {this.renderEncrypted()}
              </FormGroup>
              <FormGroup>
                <ControlLabel>Data</ControlLabel>
                <FormControl
                  className="decrypted"
                  componentClass="textarea"
                  placeholder="enter updated data"
                  value={decrypted}
                  onChange={this.onDataChange}
                />
              </FormGroup>
            </form>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default withAuthenticator(App, true, [<SimpleSignIn/>]);
