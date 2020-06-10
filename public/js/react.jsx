/* global React, ReactDOM, io, moment, AnsiUp */

const ansiUp = new AnsiUp();

function formatMemory(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(event) {
    const stateChange = {};
    stateChange[event.target.getAttribute('name').replace('login_', '')] = event.target.value;
    this.setState(stateChange);
  }

  handleLogin(event) {
    event.preventDefault();
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json()).then((res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      this.props.onHandleLogin(res);
    });
  }

  render() {
    return (
      <div>
        <form className='form-signin' onSubmit={this.handleLogin}>
          <div className='login-title'>Please sign in</div>
          <input
            type="text"
            className="form-control"
            name="login_username"
            placeholder="username"
            value={this.state.username}
            onChange={this.handleChange}
            required
            autoFocus
            data-lpignore="true"
          />
          <input
            type="password"
            className="form-control"
            name="login_password"
            placeholder="password"
            value={this.state.password}
            onChange={this.handleChange}
            required
            data-lpignore="true"
          />
          <button className='btn btn-lg btn-primary btn-block' type="submit">Sign in</button>
          {/*
          <label className='checkbox pull-left'>
            <input type="checkbox" value="remember-me" />
            Remember me
          </label>
          <a href="#" className="pull-right need-help">Need help? </a><span className="clearfix"></span>
          */}
        </form>
      </div>
    );
  }
}

class Cog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      watching: false,
    };

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
          <div className='machine-cog-icon'><i className='fas fa-cog'></i></div>
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
            <i className={`fas fa-${running ? 'stop' : 'play'}`}></i> {running ? 'Stop' : 'Run'}
          </div>
          <div className='button' onClick={this.handleButtonClick}>
            <i className='fas fa-phone-slash'></i> SIGHUP
          </div>
          <div className='button' onClick={this.handleButtonClick}>
            <i className='fas fa-wave-square'></i> SIGUSR1
          </div>
          <div className='button sigusr2'>
            <i className='fas fa-wave-square'></i> SIGUSR2
          </div>
        </div>
        <div className='console-toggle' onClick={this.handleExpandClick}>
          <i className={`fas fa-angle-${this.state.watching ? 'up' : 'down'}`}></i>
        </div>
        <div className='machine-cog-expanded' style={{display: this.state.watching ? 'block' : 'none'}}>
          <div>
            <div className='button'>
                <i className='fas fa-eraser'></i> Clear
            </div>
          </div>
          <div className='machine-cog-screen' ref={this.screenRef}>
            {this.props.stream.map((stream, idx) => (
              <span key={idx} className={stream.type === 'stderr' ? 'error' : ''} dangerouslySetInnerHTML={{__html: ansiUp.ansi_to_html(stream.data)}} />
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

class Machine extends React.Component {
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

class CogServer extends React.Component {
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

class ConnectState extends React.Component {
  render() {
    return (
      <div style={{display: this.props.connected ? 'none' : 'block', position: "absolute", top: '20px', left: '20px', zIndex: 10}}>
        <i className='fas fa-unlink fa-5x' style={{color: 'red'}}></i>
      </div>
    );
  }
}

class Users extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
    };

    this.props.socket.on('a user', (user) => {
      console.log('a user', user);
    });

    this.props.socket.on('d user', (user) => {
      console.log('d user', user);
    });

    this.props.socket.on('a users', (users) => {
      console.log('a users', users);
      this.setState({users: users});
    });
  }

  componentDidMount() {
    if (this.props.socket.connected) {
      this.props.socket.emit('q users');
    }
  }

  render() {
    return (
      <div className='user-table bg-dark'>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Is Admin</th>
              <th>Keys</th>
              {/*
              <th>Options</th>
              */}
            </tr>
          </thead>
          <tbody>
            {this.state.users.map((user, idx) => {
              return (
                <tr key={idx}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{JSON.stringify(user.isAdmin)}</td>
                  <td>{user.keys.map((key) => key.key).join(', ')}</td>
                  {/*
                  <td>
                    <div className='bg-light user-option' style={{color: '#000'}}><i className='fas fa-edit'></i></div>
                    <div className='bg-danger user-option' style={{color: '#fff'}}><i className='fas fa-trash'></i></div>
                  </td>
                  */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      socket: io('/ui', { autoConnect: false }),
      connected: true,
      authenticated: undefined,
      user: undefined,
    };

    this.state.socket.on('connect', () => {
      this.state.socket.emit('q machines');
      this.state.socket.emit('q users');
    });

    this.state.socket.on('connect_error', () => {
      this.setState({connected: false});

    });

    this.state.socket.on('disconnect', () => {
      this.setState({connected: true});
    });

    this.state.socket.on('reconnect', () => {
      this.setState({connected: true});
    });

    this.handleLogin = this.handleLogin.bind(this);
    this.socketEmit = this.socketEmit.bind(this);
    this.setView = this.setView.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      fetch('/api/auth').then((res) => res.json()).then((res) => {
        const authenticated = res.username !== undefined;
        if (authenticated) {
          this.state.socket.connect();
        }
        this.setState({
          authenticated: authenticated,
          user: res.username,
          view: 'home',
        });
      });
    }, 500);
  }

  handleLogin(res) {
    this.state.socket.connect();
    this.setState({
      authenticated: true,
      user: res.username,
    });
  }

  socketEmit(key, details) {
    this.state.socket.emit(key, details);
  }

  setView(event) {
    event.preventDefault();
    this.setState({view: event.target.textContent.toLowerCase().trim()});
  }

  render() {
    if (this.state.authenticated !== undefined) {
      if (this.state.authenticated) {
        let view = <CogServer socket={this.state.socket} />;
        if (this.state.view === 'users') {
          view = <Users socket={this.state.socket} />;
        }
        return (
          // eslint-disable-next-line react/jsx-no-undef
          <React.Fragment>
            <ConnectState connected={this.state.connected} />
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
              <a className="navbar-brand" href="#"><i className='fas fa-cogs fa-lg' style={{marginRight: '5px'}}></i>Cog Server</a>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav mr-auto">
                </ul>
                <ul className="navbar-nav">
                  <li className="nav-item nav-link" style={{marginRight: '15px'}}>
                    Welcome {this.state.user}
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' href='#' onClick={this.setView}><i className='fas fa-home'></i> Home</a>
                  </li>
                  <li className="nav-item">
                    <a className='nav-link' href='#' onClick={this.setView}><i className='fas fa-users'></i> Users</a>
                  </li>
                  <li className="nav-item">
                    <a className='nav-link' href='#'><i className='fas fa-sign-out-alt'></i> Logout</a>
                  </li>
                </ul>
              </div>
            </nav>

            {view}
          </React.Fragment>
        );
      }
      else {
        return <LoginForm onHandleLogin={this.handleLogin} />;
      }
    }
    else {
      return (
        <div id="loading">
          <i className='fas fa-cog fa-spin fa-10x'></i>
        </div>
      );
    }
  }
}

ReactDOM.render(<Container />, document.getElementById('root'));
