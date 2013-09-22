var Connection = require('./lib/connection')
;


exports.version = '0.1.1';

//constants
exports.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL = 'MysqlRegularPrtocol';
exports.DRIVER_TYPE_HANDLER_SOCKET = 'HandlerSocket';


exports._connectionPoolMap = {};

var defaultDriverType = this.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL;
exports.driverTypeList = [defaultDriverType, 'HandlerSocket'];



function HandlerSocket(settings, options){
  
  if(options === undefined){
    options = {};
  }

  this.host = this.settings;
  this.port = this.port || null;

  this.connection = null;
}

HandlerSocket.PRIMARY = 'PRIMARY';

HandlerSocket.prototype.openIndex = function(indexId, dbName, tableName, indexName, columns, cb){

  var connection;

  return cb(connection);

}


exports.createConnection = function(settings){
  if(settings === undefined){
    settings = {};
  }

  if(settings.driverType == undefined){
    settings.driverType = defaultDriverType;
  }

  return new Connection(settings);
}