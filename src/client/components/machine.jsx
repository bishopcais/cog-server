import React, { Component } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faTrash } from '@fortawesome/free-solid-svg-icons';

import { formatMemory } from '../util';
import Cog from './cog';
import socket from '../socket';

export default class Machine extends Component {
  constructor(props) {
    super(props);
    this.removeMachine = this.removeMachine.bind(this);
  }

  removeMachine() {
    socket.emit('r? machine', this.props.details);
  }

  render() {
    return (
      <div className='machine bg-dark'>
        <div className='machine-details'>
          <div>
            <div>
              <span style={{color: this.props.details.connected ? 'lightgreen' : 'red'}}><FontAwesomeIcon icon={faLink} /></span>
              {!this.props.details.connected && (
                <span style={{marginLeft: 15, cursor: 'pointer'}} onClick={this.removeMachine}><FontAwesomeIcon icon={faTrash} /></span>
              )}
            </div>
            <div>
              {this.props.details.connected ? moment(this.props.details.lastConnected).format('MM/DD/YY hh:MMa') : moment(this.props.details.lastDisconnected).format('MM/DD/YY hh:MMa')}
            </div>
          </div>
          <div>
            <div>User</div>
            <div>{this.props.details.user}</div>
          </div>
          <div>
            <div>Platform</div>
            <div>{this.props.details.platform}</div>
          </div>
          <div>
            <div>PID</div>
            <div>{this.props.details.pid}</div>
          </div>
          <div>
            <div>Hostname</div>
            <div>{this.props.details.hostname}</div>
          </div>
          <div>
            <div>CPUs</div>
            <div>{this.props.details.cpus.length}</div>
          </div>
          <div>
            <div>Memory</div>
            <div>{formatMemory(this.props.details.memory)}</div>
          </div>
          {this.props.details.interfaces.map((iface, index) => {
            return (
              <div key={index}>
                <div>{iface.family}</div>
                <div>{iface.address}</div>
              </div>
            );
          })}
        </div>
        <div className='machine-cogs-container-container'>
          <div className='machine-cogs-container d-flex flex-row flex-wrap' style={{opacity: this.props.details.connected ? '1' : '0.4'}}>
            {this.props.details.cogs.map((cog) => (
              <Cog
                key={cog.id}
                details={cog}
                machineId={this.props.details._id}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}
