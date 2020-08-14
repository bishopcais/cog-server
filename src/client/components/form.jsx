import React, { Component } from 'react';

import { ucFirst } from '../util';

export default class Form extends Component {
  constructor(props) {
    super(props);

    const state = {};
    this.props.items.forEach((item) => {
      state[item.id] = item.value || '';
    });
    this.state = state;

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const stateChange = {};
    stateChange[event.target.getAttribute('id')] = event.target.value;
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
              <input
                type={item.type || 'input'}
                id={item.id}
                name={item.id}
                value={this.state[item.id]}
                onChange={this.handleChange}
              />
            </p>
          );
        })}
      </div>
    );
  }
}
