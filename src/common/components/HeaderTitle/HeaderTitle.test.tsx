import React from 'react';
import renderer from 'react-test-renderer';
import { HeaderTitle } from '../HeaderTitle';

it('renders correctly with defaults', () => {
  const view = renderer
    .create(<HeaderTitle title='Hello World!'/>)
    .toJSON();
  expect(view).toMatchSnapshot();
});
