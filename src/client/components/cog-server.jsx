import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep'
import socket from '../socket';

import Machine from './machine';

export default class CogServer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      machines: [],
    };

    socket.on('a cog', (cog) => {
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

    socket.on('a cogs', (cogs) => {
      console.log('a cogs', cogs);
    });

    socket.on('r cog', (cog) => {
      console.log('r cog', cog);
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

    socket.on('a machine', (newMachine) => {
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

    socket.on('a machines', (machines) => {
      console.log('a machines', machines);
      this.setState({machines});
    });

    socket.on('r machine', (machine) => {
      console.log('r machine', machine);
      const machines = cloneDeep(this.state.machines);
      this.setState({
        machines: machines.filter((m) => m._id !== machine._id),
      });
    });
  }

  componentDidMount() {
    console.log('q machines');
    socket.emit('q machines');
  }

  componentWillUnmount() {
    ['a cog', 'a cogs', 'r cog', 'a machine', 'a machines', 'r machine'].forEach((key) => {
      socket.off(key);
    });
  }

  render() {
    return (
      <div className='machine-container'>
        {this.state.machines.map((item) => (
          <Machine
            key={item._id}
            details={item}
          />
        ))}
      </div>
    );
  }
}
