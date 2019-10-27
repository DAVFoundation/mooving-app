import React from 'react';
import renderer from 'react-test-renderer';

import BatteryLevel from '../BatteryLevel';

it('renders correctly with defaults', () => {
  const view = renderer
    .create(<BatteryLevel
      batteryLevel={40}/>)
    .toJSON();
  expect(view).toMatchSnapshot();
});
