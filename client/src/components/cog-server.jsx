import React, { Component } from 'react';

import { Machine } from './machine';

export class CogServer extends Component {
    constructor(props) {
      super(props);

      this.state = {
        machines: [],
        machinesStream: {},
        machinesStat: {},
      }

      this.props.socket.on('a cog', (cog) => {
        console.log('a cog', cog);
        const machines = JSON.parse(JSON.stringify(this.state.machines));
        const idx = machines.findIndex((elem) => elem._id === cog.machineId);
        if (idx === -1) {
          return;
        }
        const cogIdx = machines[idx].cogs.findIndex((elem) => elem.id === cog.id);

        if (cogIdx === -1) {
          machines[idx].cogs.push(cog);
        }
        else {
          machines[idx].cogs[cogIdx] = cog;
        }

        this.setState({machines: machines});
      });

      this.props.socket.on('a cogs', (cogs) => {
        console.log('a cogs', cogs);
      });

      this.props.socket.on('r cog', (cog) => {
        console.log('r cog', cog)
        const machines = JSON.parse(JSON.stringify(this.state.machines));
        const idx = machines.findIndex((elem) => elem._id === cog.machineId);
        if (idx === -1) {
          return;
        }
        const cogIdx = machines[idx].cogs.findIndex((elem) => elem.id === cog.id);
        if (idx === -1) {
          return;
        }
        machines[idx].cogs.splice(cogIdx, 1);
        this.setState({machines: machines});
      });

      this.props.socket.on('a machine', (newMachine) => {
        console.log('a machine', newMachine);
        const machines = JSON.parse(JSON.stringify(this.state.machines));
        const idx = machines.findIndex((elem) => elem._id === newMachine._id);
        if (idx === -1) {
          machines.push(newMachine);
        }
        else {
          machines[idx] = newMachine;
        }
        this.setState({machines: machines});
      });

      this.props.socket.on('a machines', (machines) => {
        console.log('a machines', machines);
        this.setState({machines});
      });

      this.props.socket.on('stream', (o) => {
        console.log('stream', o);
        const streams = JSON.parse(JSON.stringify(this.state.machinesStream));
        if (!streams[o.machineId]) {
          streams[o.machineId] = {};
        }
        if (!streams[o.machineId][o.cogId]) {
          streams[o.machineId][o.cogId] = [];
        }
        streams[o.machineId][o.cogId].push(o);
        if (streams[o.machineId][o.cogId].length > 20) {
          streams[o.machineId][o.cogId].shift();
        }
        this.setState({machinesStream: streams});
      });

      this.props.socket.on('stat', (stat) => {
        // console.log('stat', stat);
        const stats = JSON.parse(JSON.stringify(this.state.machinesStat));
        if (!stats[stat.machineId]) {
          stats[stat.machineId] = {};
        }
        stats[stat.machineId][stat.cogId] = stat;
        this.setState({machinesStat: stats});
      });
    }

    componentDidMount() {
      if (this.props.socket.connected) {
        this.props.socket.emit('q machines');
      }
    }

    componentWillUnmount() {
      ['a cog', 'a cogs', 'r cog', 'a machine', 'a machines', 'stream', 'stat'].forEach((key) => {
        this.props.socket.off(key);
      });
    }

    render() {
      return (
        <div className='machine-container'>
          {this.state.machines.map((item, index) => (
            <Machine
              key={index}
              details={item}
              streams={this.state.machinesStream[item._id] || {}}
              stats={this.state.machinesStat[item._id] || {}}
              onSocketEmit={this.socketEmit}
            />
          ))}
        </div>
      )
    }
  }
