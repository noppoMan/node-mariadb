var Connection = require('./lib/connection')
;

exports.version = '0.1.1';

//constants
exports.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL = 'MysqlRegularPrtocol';
exports.DRIVER_TYPE_HANDLER_SOCKET = 'HandlerSocket';


exports._connectionPoolMap = {};

var defaultDriverType = this.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL;
exports.driverTypeList = [defaultDriverType, 'HandlerSocket'];

exports.debug = false;


exports.createConnection = function(settings){
  if(settings === undefined){
    settings = {};
  }

  if(settings.driverType === undefined){
    settings.driverType = defaultDriverType;
  }

  if(settings.debug === undefined){
    settings.debug = this.debug;
  }

  return new Connection(settings);
}