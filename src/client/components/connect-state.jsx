import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlink } from '@fortawesome/free-solid-svg-icons';

export default class ConnectState extends Component {
  render() {
    return (
      <div style={{display: this.props.connected ? 'none' : 'block', position: "absolute", top: '20px', left: '20px', zIndex: 10}}>
        <FontAwesomeIcon icon={[faUnlink, 'fa-5x']} style={{color: 'red'}} />
      </div>
    );
  }
}
