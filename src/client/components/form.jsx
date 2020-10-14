import React, { Component } from 'react';

import FormInput from './form-input';
import { ucFirst } from '../util';

export default class Form extends Component {
  constructor(props) {
    super(props);

    const state = {};

    const defaultValues = {
      'array': [],
      'boolean': false,
    };

    this.items = {};

    this.props.items.forEach((item) => {
      this.items[item.id] = item;
      state[item.id] = item.value || defaultValues[item.type] || '';
    });
    this.state = state;

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const stateChange = {};

    const elemId = event.target.getAttribute('id');
    if (!elemId) {
      const item = this.items[event.target.dataset.id];
      item.value[event.target.dataset.idx] = event.target.value;
      stateChange[item.id] = item.value;
    }
    else {
      const item = this.items[elemId];
      if (item.type === 'boolean') {
        stateChange[item.id] = event.target.checked;
      }
      else {
        stateChange[item.id] = event.target.value;
      }
    }
    this.setState(stateChange);
  }

  render() {
    return (
      <div>
        {this.props.items.map((item) => {
          return (
            <p key={item.id} style={{display: item.type === 'hidden' ? 'none': 'block'}}>
              <label
                htmlFor={item.id}
              >
                {item.label || ucFirst(item.id.replace(/([a-z])([A-Z])/g, (_, first, second) => `${first} ${second.toUpperCase()}`))}
              </label>
              <FormInput
                type={item.type || 'input'}
                id={item.id}
                name={item.id}
                value={this.state[item.id]}
                onChange={this.handleChange}
                stateChange={this.stateChange}
              />
            </p>
          );
        })}
      </div>
    );
  }
}
