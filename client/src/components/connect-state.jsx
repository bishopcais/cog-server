import React, { Component } from 'react';

export class ConnectState extends Component {
    render() {
      return (
        <div style={{display: this.props.connected ? 'none' : 'block', position: "absolute", top: '20px', left: '20px', zIndex: 10}}>
          <i className='fas fa-unlink fa-5x' style={{color: 'red'}}></i>
        </div>
      );
    }
  }
