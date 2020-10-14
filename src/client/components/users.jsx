import React, { Component, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

import Form from './form';
import socket from '../socket';

export default class Users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      modalOpen: false,
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

    this.form = React.createRef();
    this.items = [];

    this.defaultItems = [
      {id: 'username'},
      {id: 'name'},
      {id: 'email'},
      {id: 'admin', type: 'boolean'},
      {id: 'keys', type: 'array'},
    ];

    this.openModalAdd = this.openModalAdd.bind(this);
    this.openModalEdit = this.openModalEdit.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  componentDidMount() {
    socket.emit('q users');
  }

  openModalAdd(event) {
    event.preventDefault();
    this.setFormItems(this.defaultItems);
    this.openModal();
  }

  openModalEdit(event, user) {
    console.log('edit');
    event.preventDefault();
    const items = this.defaultItems.slice();
    // TODO: this should map the key array object from:
    // [{_id: '<mongo_id>', key: '<key>'}, ...]
    // to just: ['<key>', ...] and so allow FormInput for array
    // to be generalizable
    items.forEach((item) => {
      item.value = user[item.id] || item.value;
    });
    this.setFormItems(items);
    this.openModal();
  }

  openModal() {
    this.setState({modalOpen: true});
  }

  closeModal(event) {
    event.preventDefault();
    this.setState({modalOpen: false});
  }

  saveUser(event) {
    event.preventDefault();
  }

  deleteUser(event, user) {
    event.preventDefault();
  }

  setFormItems(items) {
    this.items = items.slice();
  }

  render() {
    return (
      <Fragment>
        <Modal
          isOpen={this.state.modalOpen}
          className='modal-dialog bg-light'
          onRequestClose={this.closeModal}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button type="button" className="close" onClick={this.closeModal} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                <Form
                  items={this.items}
                  ref={this.form}
                />
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.saveService}>Save</button>
              <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>

        <div className='user-table bg-dark'>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Is Admin</th>
                <th>Keys</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map((user) => {
                return (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{JSON.stringify(user.isAdmin)}</td>
                    <td>{user.keys.map((key) => key.key).join(', ')}</td>
                    <td>
                      <div className='bg-light user-option' style={{color: '#000'}}>
                        <a href='#' onClick={(e) => this.openModalEdit(e, user)} data-username={user.username} title='Edit User'>
                          <FontAwesomeIcon icon={faEdit} />
                        </a>
                      </div>
                      <div className='bg-danger user-option' style={{color: '#fff'}}>
                        <a href='#' onClick={(e) => this.deleteUser(e, user)} data-username={user.username} title='Delete User'>
                          <FontAwesomeIcon icon={faTrash} title='Delete user' />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            <button type="button" className='btn btn-secondary' onClick={this.openModalAdd}>Add New User</button>
          </p>
        </div>
      </Fragment>
    );
  }
}
