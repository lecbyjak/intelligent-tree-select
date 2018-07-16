import React from 'react';
import ReactDOM from 'react-dom';
import {IntelligentTreeSelectComponent} from '../js/containers/App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<IntelligentTreeSelectComponent />, div);
});
