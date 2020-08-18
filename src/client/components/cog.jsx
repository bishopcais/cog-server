import AnsiUp from 'ansi_up';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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

import { formatMemory } from '../util';

export default class Cog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      watching: false,
    };

    this.ansiUp = new AnsiUp();
    this.screenRef = React.createRef();

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  handleButtonClick(event) {
    this.props.onSocketEmit('action', {
      action: event.target.textContent.toLowerCase().trim(),
      cogId: this.props.details.id,
      machineId: this.props.machineId,
    });
    event.preventDefault();
  }

  handleExpandClick() {
    /*
      cogEl.find('.more').toggleClass('expanded');
      btnEl.toggleClass('expanded');
      cogEl.find('.screen').html('');
      */

    const watching = !this.state.watching;

    this.props.onSocketEmit('action', {
      action: 'watch',
      cogId: this.props.details.id,
      machineId: this.props.machineId,
      watching: watching,
    });
    if (watching) {
      this.props.onSocketEmit('action', {
        action: 'playback',
        cogId: this.props.details.id,
        machineId: this.props.machineId,
      });
    }
    this.setState({watching: watching});
    event.preventDefault();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.stream.length > 0
      && (prevProps.stream.length === 0 || prevProps.stream[prevProps.stream.length-1] != this.props.stream[this.props.stream.length - 1])
    ) {
      this.screenRef.current.scrollTop = this.screenRef.current.scrollHeight;
    }
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
              {this.props.details.status}{(this.props.details.status === 'exit' && this.props.details.exitCode !== undefined) ? ' - ' + this.props.details.exitCode : ''}
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
          <div className='button sigusr2'>
            <FontAwesomeIcon icon={faWaveSquare} /> SIGUSR2
          </div>
        </div>
        <div className='console-toggle' onClick={this.handleExpandClick}>
          <FontAwesomeIcon icon={this.state.watching ? faAngleUp : faAngleDown} />
        </div>
        <div className='machine-cog-expanded' style={{display: this.state.watching ? 'block' : 'none'}}>
          <div>
            <div className='button'>
                <FontAwesomeIcon icon={faEraser} /> Clear
            </div>
          </div>
          <div className='machine-cog-screen' ref={this.screenRef}>
            {this.props.stream.map((stream, idx) => (
              <span key={idx} className={stream.type === 'stderr' ? 'error' : ''} dangerouslySetInnerHTML={{__html: this.ansiUp.ansi_to_html(stream.data)}} />
            ))}
          </div>
          <div className='stat'>
            <div>Memory: <span>{this.props.stat && this.props.stat.memory !== undefined ? formatMemory(this.props.stat.memory) : '--'}</span></div>
            <div>CPU Usage: <span>{this.props.stat && this.props.stat.cpu !== undefined ? `${this.props.stat.cpu}%` : '--'}</span></div>
          </div>
        </div>
      </div>
    );
  }
}
