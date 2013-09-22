var util = require('util')
, net = require('net')
, EventEmitter = require('events').EventEmitter
, Connection = require('../connection')
;

module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';


function HandlerSocket(settings, options){
  EventEmitter.call(this);

  var self = this;
  
  if(options === undefined){
    options = {};
  }

  this.connection = new Connection(settings, options);

  //override events
  this.connection.on('connect', function(){
    self.emit('connect');
  });

  this.connection.on('close', function(data){
    self.emit('close', data);
  });

  this.connection.on('error', function(err){
    self.emit('error', err);
  });

}
util.inherits(HandlerSocket, EventEmitter);

HandlerSocket.prototype.openIndex = function(indexId, dbName, tableName, indexName, columns, cb){

  //return cb(connection);

}