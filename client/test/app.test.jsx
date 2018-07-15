import App from '../src/app';
import React from 'react';
import { mount } from 'enzyme';

test('Can render App component', () => {
    const app = mount(<App />);
});