var util = require('util')
, net = require('net')
, EventEmitter = require('events').EventEmitter
;


exports.version = '0.1.1';


function HandlerSocket(settings, options){
  
  if(options === undefined){
    options = {};
  }

  this.host = this.settings;
  this.port = this.port || null;

  this.connection = null;
}

util.inhelits(HandlerSocket, EventEmitter);


HandlerSocket.PRIMARY = 'PRIMARY';

HandlerSocket.prototype.openIndex = function(indexId, dbName, tableName, indexName, columns, cb){

  var connection;

  return cb(connection);

}

var defaultDriverType = 'MysqlRegularProtocol';
exports.driverTypeList = [defaultDriverType, 'HandlerSocket'];

exports.createConnection = function(settings){

  if(settings === undefined){
    settings = {};
  }

  if(settings.driverType == undefined){
    settings.driverType = defaultDriverType;
  }

  return new settings.driverType;
}
