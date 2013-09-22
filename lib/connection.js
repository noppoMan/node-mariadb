var util = require('util')
, net = require('net')
, EventEmitter = require('events').EventEmitter
;

module.exports = Connection;

function Connection(settings, options){
  EventEmitter.call(this);

  var self = this;

  this.host = settings.host || 'localhost';
  this.port = settings.port || 3306;

  this.connectionAutoClose = options.connectionAutoClose || false;


  this.sock = new net.Socket({ allowHalfOpen: true })
  this.sock.setEncoding('utf8');

  this.sock.on('connect', function() {
    self.emit('connect');
  });

  this.sock.on('close', function(err) {
    self.emit('close', err);
  });

  this.sock.on('error', function(err) {
    self.emit('error', err);
  });

  this.sock.connect(this.port, this.host);
}
util.inherits(Connection, EventEmitter);


Connection.prototype.close = function(cb){
  this.sock.end();
}

Connection.prototype._send = function(){

  console.log(sock);

}








