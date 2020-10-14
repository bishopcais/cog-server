import React, { Component } from 'react';
import socket from '../socket';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCogs, faNetworkWired, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import ConnectState from './connect-state';
import CogServer from './cog-server';
import LoginForm from './login-form';
import Services from './services';
import Users from './users';

export default class Container extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: true,
      authenticated: undefined,
      user: undefined,
      view: undefined,
    };

    socket.on('connect_error', () => {
      this.setState({connected: false});

    });

    socket.on('disconnect', () => {
      this.setState({connected: true});
    });

    socket.on('reconnect', () => {
      this.setState({connected: true});
    });

    this.handleLogin = this.handleLogin.bind(this);
    this.setView = this.setView.bind(this);
  }

  componentDidMount() {
    if (location.hash) {
      this.setState({view: location.hash.substring(1)});
    }

    setTimeout(() => {
      fetch('/api/auth').then((res) => res.json()).then((res) => {
        const authenticated = res.username !== undefined;
        new Promise((resolve) => {
          if (authenticated) {
            socket.connect();
            const checkConn = () => {
              setTimeout(() => {
                if (socket.connected) {
                  return resolve();
                }
                checkConn();
              }, 1000);
            };
            checkConn();
          }
          else {
            resolve();
          }
        }).then(() => {
          this.setState({
            authenticated: authenticated,
            user: res.username,
            view: !this.state.view ? 'cogs' : this.state.view,
          });
        });
      });

    }, 500);
  }

  handleLogin(res) {
    socket.connect();
    this.setState({
      authenticated: true,
      user: res.username,
    });
  }

  setView(event) {
    event.preventDefault();
    const view = event.currentTarget.textContent.toLowerCase().trim();
    location.hash = view;
    this.setState({view});
  }

  render() {
    if (this.state.authenticated !== undefined) {
      if (this.state.authenticated) {
        let view;
        if (this.state.view === 'users') {
          view = <Users />;
        }
        else if (this.state.view === 'services') {
          view = <Services />;
        }
        else {
          view = <CogServer />;
        }

        return (
          // eslint-disable-next-line react/jsx-no-undef
          <React.Fragment>
            <ConnectState connected={this.state.connected} />
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
              <a className="navbar-brand" href="#"><FontAwesomeIcon icon={faCogs} style={{marginRight: '5px'}} size='lg' /> Cog Server</a>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav mr-auto">
                </ul>
                <ul className="navbar-nav">
                  <li className="nav-item nav-link" style={{marginRight: '15px'}}>
                    Welcome {this.state.user}
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' href='#' onClick={this.setView}><FontAwesomeIcon icon={faCogs} /> Cogs</a>
                  </li>
                  <li className='nav-item'>
                    <a className='nav-link' href='#' onClick={this.setView}><FontAwesomeIcon icon={faNetworkWired} /> Services</a>
                  </li>
                  <li className="nav-item">
                    <a className='nav-link' href='#' onClick={this.setView}><FontAwesomeIcon icon={faUsers} /> Users</a>
                  </li>
                  <li className="nav-item">
                    <a className='nav-link' href='#'><FontAwesomeIcon icon={faSignOutAlt} /> Logout</a>
                  </li>
                </ul>
              </div>
            </nav>

            {view}
          </React.Fragment>
        );
      }

      return <LoginForm onHandleLogin={this.handleLogin} />;
    }

    return (
      <div id="loading">
        <FontAwesomeIcon icon={faCog} spin={true} size={'10x'} />
      </div>
    );
  }
}
