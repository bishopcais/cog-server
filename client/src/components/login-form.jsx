
import React, { Component } from 'react';

export class LoginForm extends Component {
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
