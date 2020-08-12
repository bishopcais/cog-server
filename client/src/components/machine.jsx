/* global moment */

import React, { Component } from 'react';
import { formatMemory } from '../util';

import { Cog } from './cog';

export class Machine extends Component {
    render() {
      return (
        <div className='machine bg-dark'>
          <div className='machine-details'>
            <div>
              <div style={{color: this.props.details.connected ? 'lightgreen' : 'red'}}><i className="fas fa-link"></i></div>
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
            <div className='machine-cogs-container d-flex flex-row' style={{opacity: this.props.details.connected ? '1' : '0.4'}}>
              {this.props.details.cogs.map((cog, index) => (
                <Cog
                  key={index}
                  details={cog}
                  machineId={this.props.details._id}
                  onSocketEmit={this.props.onSocketEmit}
                  stream={this.props.streams[cog.id] || []}
                  stat={this.props.stats[cog.id] || {}}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }
  }
