import React, { Component } from 'react';

import './App.css';
import SimpleSignIn from './SimpleSignIn';
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
import { chunkString, fetchData, saveData } from './utils'
import { encrypt, decrypt } from './cipher';

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

  async componentDidMount() {
    const encrypted = await fetchData(this.state);
    this.setState({ encrypted });
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
    setTimeout(() => this.setState({feedback: null}), 3500);
  }

  async onSave() {
    const feedback = await saveData(this.state);
    this.setFeedback(feedback);
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
            <Panel.Title>Keep it Secret, Keep it Safe</Panel.Title>
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
