import AnsiUp from 'ansi_up';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faStop,
  faPlay,
  faPhoneSlash,
  faWaveSquare,
  faAngleUp,
  faAngleDown,
  faEraser,
} from '@fortawesome/free-solid-svg-icons';

import socket from '../socket';
import { formatMemory } from '../util';

const ansiUp = new AnsiUp();
/* eslint-disable-next-line camelcase */
ansiUp.use_classes = true;

export default class Cog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      watching: false,
      stream: [],
      stat: null,
    };

    this.screenRef = React.createRef();

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleExpandClick = this.handleExpandClick.bind(this);

    this.streamFn = (o) => {
      if (o.machineId !== this.props.machineId || o.cogId !== this.props.details.id) {
        return;
      }
      const stream = JSON.parse(JSON.stringify(this.state.stream));
      stream.push(o);
      if (stream.length > 20) {
        stream.shift();
      }
      this.setState({stream});
    };
    socket.on('stream', this.streamFn);

    this.clearFn = (o) => {
      if (o.machineId !== this.props.machineId || o.cogId !== this.props.details.id) {
        return;
      }
      this.setState({stream: []});
    };
    socket.on('clear', this.clearFn);

    this.statFn = (stat) => {
      if (stat.machineId !== this.props.machineId || stat.cogId !== this.props.details.id) {
        return;
      }
      this.setState({stat});
    };
    socket.on('stat', this.statFn);
  }

  componentWillUnmount() {
    socket.off('stream', this.streamFn);
    socket.off('clear', this.clearFn);
    socket.off('stat', this.statFn);
  }

  handleButtonClick(event) {
    socket.emit('action', {
      action: event.currentTarget.textContent.toLowerCase().trim(),
      cogId: this.props.details.id,
      machineId: this.props.machineId,
    });
    event.preventDefault();
  }

  handleExpandClick(event) {
    const watching = !this.state.watching;

    socket.emit('action', {
      action: 'watch',
      cogId: this.props.details.id,
      machineId: this.props.machineId,
      watching: watching,
    });
    if (watching) {
      this.setState({stream: []});
      socket.emit('action', {
        action: 'playback',
        cogId: this.props.details.id,
        machineId: this.props.machineId,
      });
    }
    this.setState({watching: watching});
    event.preventDefault();
  }

  render() {
    const running = this.props.details.status === 'running';
    return (
      <div className='machine-cog bg-dark'>
        <div className='machine-cog-titlebar'>
          <div className='machine-cog-icon'><FontAwesomeIcon icon={faCog} /></div>
          <div className='machine-cog-title'>{this.props.details.id}</div>
        </div>
        <div className='machine-cog-details'>
          <div>
            <div>Status</div>
            <div style={{color: running ? 'lightgreen' : 'red'}}>
              {this.props.details.status}{(this.props.details.status === 'exit' && this.props.details.exitCode !== undefined) ? ` - ${this.props.details.exitCode}` : ''}
            </div>
          </div>
          <div>
            <div>Type</div>
            <div></div>
          </div>
          <div>
            <div>Host</div>
            <div>{this.props.details.host}</div>
          </div>
          <div>
            <div>Port</div>
            <div>{this.props.details.port}</div>
          </div>
          <div>
            <div>Command</div>
            <div>{this.props.details.run} {this.props.details.args.join(' ')}</div>
          </div>
          <div>
            <div>PID</div>
            <div>{this.props.details.pid}</div>
          </div>
        </div>
        <div className='machine-cog-buttons'>
          <div className='button' onClick={this.handleButtonClick}>
            <FontAwesomeIcon icon={running ? faStop : faPlay} /> {running ? 'Stop' : 'Run'}
          </div>
          <div className='button' onClick={this.handleButtonClick}>
            <FontAwesomeIcon icon={faPhoneSlash} /> SIGHUP
          </div>
          <div className='button' onClick={this.handleButtonClick}>
            <FontAwesomeIcon icon={faWaveSquare} /> SIGUSR1
          </div>
          <div className='button' onClick={this.handleButtonClick}>
            <FontAwesomeIcon icon={faWaveSquare} /> SIGUSR2
          </div>
        </div>
        <div className='console-toggle' onClick={this.handleExpandClick}>
          <FontAwesomeIcon icon={this.state.watching ? faAngleUp : faAngleDown} />
        </div>
        <div className='machine-cog-expanded' style={{display: this.state.watching ? 'block' : 'none'}}>
          <div>
            <div className='button' onClick={this.handleButtonClick}>
              <FontAwesomeIcon icon={faEraser} /> Clear
            </div>
          </div>
          <div className='machine-cog-screen' ref={this.screenRef}>
            {this.state.stream.map((stream, idx) => (
              <span key={idx} className={stream.type === 'stderr' ? 'error' : ''} dangerouslySetInnerHTML={{__html: ansiUp.ansi_to_html(stream.data)}} />
            ))}
          </div>
          <div className='stat'>
            <div>Memory: <span>{this.state.stat && this.state.stat.memory !== undefined ? formatMemory(this.state.stat.memory) : '--'}</span></div>
            <div>CPU Usage: <span>{this.state.stat && this.state.stat.cpu !== undefined ? `${this.state.stat.cpu}%` : '--'}</span></div>
          </div>
        </div>
      </div>
    );
  }
}
