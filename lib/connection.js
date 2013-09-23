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
  this.timeout = settings.timeout || 120;

  this.connectionAutoClose = options.connectionAutoClose || false;

  this._sock = new net.Socket({ allowHalfOpen: true });
  //Force set encoding as utf8
  this._sock.setEncoding('utf8');

  //connect to host:port
  this._sock.connect(this.port, this.host);

  this._sock.on('connect', function() {
    self.emit('connect');
  });

  this._sock.on('close', function(err) {
    self.emit('close', err);
  });

  this._sock.on('error', function(err) {
    self.emit('error', err);
  });

  this._sock.on('timeout', function(err) {
    self.emit('error', err);
  });

}
util.inherits(Connection, EventEmitter);


Connection.prototype.send = function(req, cb){

  function encodeRequest(fields) {
    return fields.join('\t') + '\n';
  }

  var encoded = encodeRequest(req);

  this._sock.write(encoded, 'utf-8');
  this._sock.once('data', function(data){
    cb(data);
  });

}

Connection.prototype.heartbeat = function(cb){

}


Connection.prototype.close = function(cb){
  this._sock.end();
}








