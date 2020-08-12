/* global io */

import React, { Component } from 'react';

import { ConnectState } from './connect-state';
import { CogServer } from './cog-server';
import { LoginForm } from './login-form';
import { Users } from './users';

export class Container extends Component {
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
