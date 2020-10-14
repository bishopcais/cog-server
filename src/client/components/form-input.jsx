import React, { Component } from 'react';

export default class FormInput extends Component {
  constructor(props) {
    super(props);

    this.onArrayChange = this.onArrayChange.bind(this);
  }

  onArrayChange(event, idx) {
    const values = this.props.value;
    values[idx] = event.target.value;
    this.props.stateChange(event, values);
  }

  render() {
    console.log(this.props);

    if (['hidden', 'input', 'number'].includes(this.props.type)) {
      return (
        <input
          type={this.props.type}
          id={this.props.id}
          name={this.props.name}
          value={this.props.value}
          onChange={this.props.onChange}
        />
      );
    }
    else if (this.props.type === 'boolean') {
      return (
        <input
          type='checkbox'
          id={this.props.id}
          name={this.props.name}
          checked={this.props.value}
          onChange={this.props.onChange}
        />
      );
    }
    else if (this.props.type === 'array') {
      const keys = this.props.value.map((val, idx) => {
        return (
          <div key={val._id}><input type='input' name={`key_${idx}`} data-id={this.props.id} data-idx={idx} value={val.key} onChange={this.props.onChange} /></div>
        );
      });
      return (
        <div>
          {keys}
        </div>
      );
    }
    return (
      <div>
        NOT IMPLEMENTED
      </div>
    );
  }
}
