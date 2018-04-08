import React from 'react';
import { I18n } from 'aws-amplify';
import {
  SignIn,
  FormSection,
  SectionHeader,
  SectionBody,
  InputRow,
  ButtonRow
} from 'aws-amplify-react'

// SignIn w/o the footer and federated buttons
class SimpleSignIn extends SignIn {
  showComponent() {
    const { hide } = this.props;
    if (hide && hide.includes(SignIn)) { return null; }

    return (
      <FormSection>
        <SectionHeader>{I18n.get('Sign In Account')}</SectionHeader>
        <SectionBody>
          <InputRow
            autoFocus
            placeholder={I18n.get('Username')}
            key="username"
            name="username"
            onChange={this.handleInputChange}
          />
          <InputRow
            placeholder={I18n.get('Password')}
            key="password"
            type="password"
            name="password"
            onChange={this.handleInputChange}
          />
          <ButtonRow onClick={this.signIn}>
            {I18n.get('Sign In')}
          </ButtonRow>
        </SectionBody>
      </FormSection>
    )
  }
}

export default SimpleSignIn;
