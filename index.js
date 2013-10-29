var utility = require('./lib/utility');

//version
exports.version = '0.1.1';

//constants
exports.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL = 'MysqlRegularPrtocol';
exports.DRIVER_TYPE_HANDLER_SOCKET = 'HandlerSocket';

exports.HandlerSocket = require('./lib/driver/handler_socket');

exports.createConnection = function(settings){
  if(settings === undefined){
    settings = {};
  }

  var options = {};
  if(typeof settings.options === 'object'){
    options = settings.options;
  }

  if(settings.driverType === undefined){
    settings.driverType = this.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL;
  }

  var className = settings.driverType
    , fileName = utility.toSnakeCase(className)
  ;

  var Driver = require('./lib/driver/' + fileName);
  var driver = new Driver(settings, options);

  driver.usingAs = settings.driverType
  
  return driver;
}