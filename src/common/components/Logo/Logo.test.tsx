import React from 'react';
import renderer from 'react-test-renderer';
import Logo from '../Logo';

it('renders correctly with defaults', () => {
  const view = renderer
    .create(<Logo isDark/>)
    .toJSON();
  expect(view).toMatchSnapshot();
});
