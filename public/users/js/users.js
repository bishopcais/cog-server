var socket = io('/ui');
var rowTemplate = _.template($('#user-row-template').html());
var keyTemplate = _.template($('#key-template').html());
var modalTemplate = _.template($('#user-modal-template').html());

var ModalView = Backbone.View.extend({
  el: '<div class="modal"></div>',

  events: {
    'click [data-action=save]': 'save',
    'click [data-action=add-key]': 'addKey',
    'click [data-action=delete-key]': 'removeKey',
  },

  save: function() {
    var u = {
      username: this.$('[name=username]').val(),
      email: this.$('[name=email]').val(),
      name: this.$('[name=name]').val(),
      password: this.$('[name=password]').val(),
      is_admin: this.$('[name="is-admin"]').prop('checked'),
      keys: _.map(this.keys, function(k) { return {key: k }; })
    };
    if (!u.username) {
      return alert('Username cannot be empty.');
    }
    socket.emit('u user', u);
    this.$el.modal('hide');
  },

  addKey: function() {
    this.keys.push(this.$('[name=new-key]').val());
    this.$('[name=new-key]').val('')
    this.keys = _.uniq(this.keys);
    this.showKeys();
  },

  removeKey: function(evt) {
    var key = $(evt.currentTarget).attr('data-key');
    this.keys = _.without(this.keys, key);
    this.showKeys();
  },

  show: function(user) {
    this.$el.html(modalTemplate({ user: user }));
    this.$el.modal('show');
    this.keys = _.pluck(user.keys, 'key');
    this.showKeys();
  },

  showKeys: function(keys) {
    var el = this.$('[data-container=keys]').html('');
    _.each(this.keys, function(k) {
      el.append(keyTemplate({ key: k}));
    });
  }
});

var View = Backbone.View.extend({
  initialize: function() {
    var v = view;
    socket.on('a user', this.renderUser.bind(this));
    socket.on('d user', this.removeUser.bind(this));
    socket.on('a users', this.renderUsers.bind(this));

    this.rowsEl = this.$('[data-container="user-rows"]');
  },

  load: function() {
    socket.emit('q users');
  },

  loadConnectionError: function() {
    this.$el.html('Error establishing connection.');
  },

  renderUsers: function(users) {
    var v = this;
    this.users = users;
    this.rowsEl.html('');
    users.forEach(this.renderUser.bind(this));
  },

  renderUser: function(user) {
    var tr = this.$('[data-id=' + user.username + ']');
    if (!tr.length) {
      tr = $('<tr data-id="' + user.username + '"></tr>');
      this.rowsEl.append(tr);
    }

    tr.html(rowTemplate({ user: user }));
  },

  removeUser: function(user) {
    this.$('[data-id=' + user.username + ']').remove();
  },

  events: {
    'click [data-action=new]': 'onClickNew',
    'click [data-action=delete]': 'onClickDelete',
    'click [data-action=edit]': 'onClickMore'
  },

  onClickNew: function(evt) {
    this.showModal({});
  },

  onClickDelete: function(evt) {
    if (!confirm('Do you want to delete this user?')) return;
    socket.emit('d user', { username: $(evt.currentTarget).attr('data-username') });
  },

  onClickMore: function(evt) {
    var user = _.findWhere(this.users, { username: $(evt.currentTarget).attr('data-username') });
    this.showModal(user);
  },

  showModal: function(user) {
    this.modalView = this.modalView || new ModalView();
    this.modalView.show(user);
  },
});

var view = new View({ el: $('[data-container="main"]') });
socket.on('connect', function(){
  view.load();
});
socket.on('error', function(){
  view.loadConnectionError();
});