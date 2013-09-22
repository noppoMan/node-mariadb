var util = require('util')
, net = require('net')
, EventEmitter = require('events').EventEmitter
;

module.exports = Connection;

function Connection(settings){
  EventEmitter.call(this);

  this.host = settings.host || 'localhost';
  this.port = settings.host || 9998;
  this.auth = settings.auth;

  var sock = new net.Socket({ allowHalfOpen: true })
  sock.setEncoding('utf8');

  sock.on('connect', function() {

  });

  sock.connect(this.port, this.host);


}

util.inherits(Connection, EventEmitter);

