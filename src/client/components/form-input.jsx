import React, { Component } from 'react';

export default class FormInput extends Component {
  constructor(props) {
    super(props);

    this.onArrayChange = this.onArrayChange.bind(this);
    this.onArrayAdd = this.onArrayAdd.bind(this);
    this.onArrayRemove = this.onArrayRemove.bind(this);
  }

  onArrayChange(event, idx) {
    const values = this.props.value;
    values[idx] = event.target.value;
    this.props.changeState(event.currentTarget.dataset.id, values);
  }

  onArrayAdd(event) {
    const values = this.props.value;
    values.push({
      key: '',
    });
    this.props.changeState(event.currentTarget.dataset.id, values);
  }

  onArrayRemove(event, idx) {
    const values = this.props.value;
    values.splice(idx, 1);
    this.props.changeState(event.currentTarget.dataset.id, values);
  }

  render() {
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
          <div key={val._id || `idx_${idx}`}>
            <input type='input' name={`key_${idx}`} data-id={this.props.id} data-idx={idx} value={val.key} onChange={this.props.onChange} />
            <span data-id={this.props.id} data-idx={idx} onClick={(e) => this.onArrayRemove(e, idx)}>-</span>
          </div>
        );
      });
      return (
        <div>
          {keys}
          <div>
            <span data-id={this.props.id} onClick={this.onArrayAdd}>+</span>
          </div>
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
