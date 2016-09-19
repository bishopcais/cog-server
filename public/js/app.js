var
  socket = io('/ui', { autoConnect: false }),
  navTemplate = _.template($('#nav-template').html()),
  machineTemplate = _.template($('#machine-template').html()),
  cogTemplate = _.template($('#cog-template').html()),
  cogInfoTemplate = _.template($('#cog-info-template').html()),
  cogButtonsTemplate = _.template($('#cog-buttons-template').html()),
  modalTemplate = _.template($('#cog-modal-template').html());


var View = Backbone.View.extend({
  initialize: function() {
    var v = this;
    socket.on('a cog', this.renderCog.bind(this));
    socket.on('a cogs', this.renderCogs.bind(this));
    socket.on('r cog', this.removeCog.bind(this));
    socket.on('a machine', this.renderMachine.bind(this));
    socket.on('a machines', this.renderMachines.bind(this));
    socket.on('stream', this.onStream.bind(this));
    socket.on('stat', this.onStat.bind(this));
  },
  
  load: function() {
    socket.emit('q machines');
  },

  getMachineContainer: function(id) {
    var div = this.$('.machine-container[data-id=' + id + ']');
    if (div.length)
      return div;
    div = $(
      '<div data-id="' + id + '" class="machine-container">' +
        '<div data-container="machine" class="machine"></div>' +
        '<div data-container="cogs" class="cogs"></div>' +
        '<div class="clearfix"></div>' +
      '</div>'
    );
    this.$('[data-container=machines]').append(div);
    return div;
  },

  renderMachines: function(machines) {
    machines.forEach(this.renderMachine.bind(this));
  },

  renderMachine: function(machine) {
    var view = this;
    var mEl = this.getMachineContainer(machine._id);
    mEl.find('[data-container="machine"]').html(
      machineTemplate({ machine : machine })
    );
    if (!machine.connected)
      mEl.addClass('disconnected');
    else 
      mEl.removeClass('disconnected');
      
    mEl
      .find('[data-container="cogs"]')
      .html('');

    machine.cogs.forEach(function(cog) {
      cog.machineId = machine._id;
    });
    
    this.renderCogs(machine.cogs);
    mEl.find('[data-toggle="tooltip"]').tooltip();
  },

  renderCogs: function(cogs) {
    cogs.forEach(function(cog) {
      view.renderCog(cog);
    });    
  },

  renderCog: function(cog) {
    var div = this.$(
      '[data-cog-_id= ' + cog._id + 
      '][data-machine-id="' + cog.machineId + '"]'
    );
    if (!div.length) {
      div = $(
        '<div class="cog" data-cog-_id="' + cog._id + 
        '" data-cog-id="' + cog.id + '"' +
        '" data-machine-id="' + cog.machineId + '">'
      );
      this
        .getMachineContainer(cog.machineId)
        .find('[data-container="cogs"]')
        .append(div);
      div.html( cogTemplate({ cog: cog }) );
    }

    div.find('[data-container="info"]').html( cogInfoTemplate({ cog: cog }) );
    div.find('[data-container="buttons"]').html( cogButtonsTemplate({ cog: cog }) );

  },

  removeCog: function(cog) {
    this.$(
      '[data-cog-id= ' + cog.id + 
      '][data-machine-id="' + cog.machineId + '"]'
    ).remove();
  },

  events: {
    'click [data-action]': 'clickAction'
  },

  clickAction: function(evt) {
    var
      btnEl = $(evt.currentTarget),
      cogEl = btnEl.closest('.cog'),
      cogId = cogEl.attr('data-cog-id'),
      machineId = cogEl.attr('data-machine-id'),
      action=btnEl.attr('data-action');

    var action;

    if (action == 'expand') {
      cogEl.find('.more').toggleClass('expanded');
      btnEl.toggleClass('expanded');
      cogEl.find('.screen').html('');

      socket.emit('action', {
        action: 'watch',
        cogId: cogId,
        machineId: machineId,
        watching: btnEl.hasClass('expanded')
      });

      socket.emit('action', {
        action: 'playback',
        cogId: cogId,
        machineId: machineId
      });

    } else if (action == 'stop') {
      socket.emit('action', {
        action: 'stop',
        cogId: cogId,
        machineId: machineId
      });
    } else if (action == 'run') {
      socket.emit('action', {
        action: 'run',
        cogId: cogId,
        machineId: machineId
      }, action);
    }
  },

  onStream: function(o) {
    var el = this.$(
      '[data-cog-id="' + o.cogId + 
      '"][data-machine-id="' + o.machineId + 
      '"] [data-container="screen"]'
    );

    var txt = (o.type == 'stderr') ? 
      '<span class="error">' + o.data + '</span>':
      '<span class="">' + o.data + '</span>';

    el.append(txt);
    if (el.children().length > 20)
      $(el.children()[0]).remove();

    el.scrollTop(el[0].scrollHeight);
  },

  onStat: function(st) {
    var cogEl = this.$(
      '[data-cog-id="' + st.cogId + 
      '"][data-machine-id="' + st.machineId + 
      '"]'
    );
    cogEl.find('[data-container=memory-usage]').html(
      (st.memory / 1024 /1024).toFixed(2) + ' MB'
    );
    cogEl.find('[data-container=cpu-usage]').html(
      st.cpu.toFixed(2) + '%'
    );
  }
});


var NavView = Backbone.View.extend({
  load: function() {
    this.$el.html(navTemplate({ username: loginUser }) );
  },

  events: {
    'click [data-action=logout]': 'logout'
  },

  logout: function(evt) {
    var btn = $(evt.currentTarget).button('loading');
    $.ajax({ 
      url: AUTH_URL,
      method: 'DELETE',
      success: function() { window.location.reload(); },
      complete: function() { btn.button('reset'); }
    })
  }
})

// Login
var
  AUTH_URL = '/api/auth',
  authEl = $('.authentication'),
  navEl = $('.nav'),
  loginBtn = $('.authentication [data-action=login]'),
  usernameEl = $('.authentication [name=username]'),
  passwordEl = $('.authentication [name=password]'),
  loginUser;

var login = function() {
  var username = usernameEl.val();
  var password = passwordEl.val();

  loginBtn.button('loading');
  $.ajax({
    type: 'POST',
    url: AUTH_URL,
    processData: false,
    contentType: 'application/json',
    data: JSON.stringify({ username: username, password: password }),
    success: function(r) {
      socket.connect();
      authEl.addClass('hidden');
      loginUser = username;
    },
    error: function(r){
      alert(r.responseJSON ? r.responseJSON.error : 'Error loggin in.');
    },
    complete: function() { loginBtn.button('reset'); }
  });
}

loginBtn.on('click', login);
passwordEl.on('keydown', function(evt){
  if (evt.keyCode == 13) loginBtn.click();
});

// Set up socket view.
var view = new View({ el: '[data-container=main]' });
var navView = new NavView({ el: '[data-container=nav]' });
socket.on('connect', function(){
  view.load();
  navView.load();
});
socket.on('connect_error', function(){
  $('.no-service-icon').show();
});
socket.on('disconnect', function(){
  $('.no-service-icon').show();
})
socket.on('reconnect', function(){
  // $('.no-service-icon').hide();
  // view.load();
})


// Check Logged In.
$.ajax({
  method: 'GET',
  url: AUTH_URL,
  success: function(json) {
    if (json.username) {
      loginUser = json.username;
      socket.connect();
    } else {
      authEl.removeClass('hidden');
    }
  },
  error: function() { alert('Can\'t reach aip')  },
});
