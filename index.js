//version
exports.version = '0.1.1';

//constants
exports.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL = 'MysqlRegularPrtocol';
exports.DRIVER_TYPE_HANDLER_SOCKET = 'HandlerSocket';

var defaultDriverType = this.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL;
exports.driverTypeList = [defaultDriverType, 'HandlerSocket'];

exports.createConnection = function(settings){
  
  if(settings === undefined){
    settings = {};
  }

  var options = {};
  if(typeof settings.options === 'object'){
    options = settings.options;
  }

  if(settings.driverType === undefined){
    settings.driverType = defaultDriverType;
  }

  var className = settings.driverType
    , fileName = toSnakeCase(className)
  ;

  var Driver = require('./lib/driver/'+fileName);
  var driver = new Driver(settings, options);
  driver.usingAs = settings.driverType

  return driver;
}


function toSnakeCase(str){

  var capitalizeFirstLetter = function(str){
   return str.charAt(0).toLowerCase() + str.slice(1);
  };

  var s = capitalizeFirstLetter(str);

  var len = s.length;

  var converted = '';

  for(var i = 0; i < len; i++){
    if(s[i].match(/[A-Z]/)){
      converted += '_' + s[i].toLowerCase();
    }
    else
    {
      converted += s[i];
    }
  }
  return converted;
}



