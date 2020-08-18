import React, { Component } from 'react';

import socket from '../socket';

export default class Users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
    };

    socket.on('a user', (user) => {
      console.log('a user', user);
    });

    socket.on('d user', (user) => {
      console.log('d user', user);
    });

    socket.on('a users', (users) => {
      console.log('a users', users);
      this.setState({users: users});
    });
  }

  componentDidMount() {
    socket.emit('q users');
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
