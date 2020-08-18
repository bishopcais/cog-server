import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';

import socket from '../socket';
import Form from './form';

export default class Services extends Component {
  constructor(props) {
    super(props);

    this.state = {
      services: [],
      modalOpen: false,
    };

    socket.on('a services', (services) => {
      console.log('a services', services);
      this.setState({services});
    });

    /*
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
    */

    socket.on('q? services', () => {
      console.log('q? services');
      socket.emit('q services')
    });

    this.openModalAdd = this.openModalAdd.bind(this);
    this.openModalEdit = this.openModalEdit.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.saveService = this.saveService.bind(this);
    this.deleteService = this.deleteService.bind(this);

    this.form = React.createRef();

    this.defaultItems = [
      {id: 'instanceName'},
      {id: 'serviceType'},
      {id: 'host', value: 'localhost'},
      {id: 'port', type: 'number'},
      {id: 'launchPath'},
      {id: 'launchInvocation'},
      {id: 'pid', label: 'PID', type: 'number'},
      {id: 'testRoute', value: '/test'},
      {id: 'testInterval', type: 'number', value: 30},
    ];
  }

  componentDidMount() {
    socket.emit('q services');
  }

  openModalAdd(event) {
    event.preventDefault();
    this.setFormItems(this.defaultItems);
    this.openModal();
  }

  openModalEdit(event) {
    event.preventDefault();
    const service = JSON.parse(JSON.stringify(this.state.services.filter((item) => item._id === event.target.dataset.id)[0]));
    const items = this.defaultItems.slice();
    items.forEach((item) => {
      item.value = service[item.id] || item.value;
    });
    items.push({
      id: 'id', type: 'hidden', value: service._id,
    });
    this.setFormItems(items);
    this.openModal();
  }

  openModal() {
    this.setState({modalOpen: true});
  }

  closeModal() {
    event.preventDefault();
    this.setState({modalOpen: false});
  }

  saveService(event) {
    event.preventDefault();

    fetch('/api/service', {
      method: 'POST',
      body: JSON.stringify(this.form.current.state),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json()).then((res) => {
      console.log(res);
      socket.emit('q services');
      this.setState({modalOpen: false});
    });
  }

  deleteService(event) {
    event.preventDefault();
    fetch('/api/service', {
      method: 'DELETE',
      body: JSON.stringify({
        id: event.target.dataset.id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(res => {
      console.log(res);
      socket.emit('q services');
    });
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
        <div className='services-table bg-dark'>
          <table style={{marginBottom: '20px'}}>
            <thead>
              <th>Service Type</th>
              <th>Name</th>
              <th>Host</th>
              <th>Port</th>
              <th>Test Route</th>
              <th>Test Interval (sec)</th>
              <th>Launch Path</th>
              <th>Launch Invocation</th>
              <th>PID</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Last Modified</th>
              <th>Last Registered</th>
              <th colSpan='2'>Options</th>
            </thead>
            <tbody>
              {this.state.services.map((service, idx) => {
                return (
                  <tr key={`service-${idx}`} style={{backgroundColor: service.status === 'UNRESPONSIVE' ? 'rgb(255,133,133)' : ''}}>
                    <td>{service.serviceType}</td>
                    <td>{service.instanceName}</td>
                    <td>{service.host}</td>
                    <td>{service.port}</td>
                    <td>{service.testRoute}</td>
                    <td>{service.testInterval}</td>
                    <td>{service.launchPath}</td>
                    <td>{service.launchInvocation}</td>
                    <td>{service.pid}</td>
                    <td>{service.status}</td>
                    <td>{service.lastActive}</td>
                    <td>{service.lastModified}</td>
                    <td>{service.lastRegistered}</td>
                    <td><a href='#' data-id={service._id} onClick={this.openModalEdit}>Edit</a></td>
                    <td><a href='#' data-id={service._id} onClick={this.deleteService}>Delete</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            <button type="button" className='btn btn-secondary' style={{marginRight: '10px'}}>Probe All Services Now</button>
            <button type="button" className='btn btn-secondary' onClick={this.openModalAdd}>Add New Service</button>
          </p>
        </div>
      </Fragment>
    );
  }
}
