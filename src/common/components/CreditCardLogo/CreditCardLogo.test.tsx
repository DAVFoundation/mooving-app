import React from 'react';
import renderer from 'react-test-renderer';
import CreditCardLogo from '../CreditCardLogo';

it('renders correctly with defaults', () => {
  const view = renderer
    .create(<CreditCardLogo brand='not-a-real-brand'/>)
    .toJSON();
  expect(view).toMatchSnapshot();
});
