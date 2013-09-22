module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';


function HandlerSocket(settings, options){
  
  if(options === undefined){
    options = {};
  }

  this.host = this.settings;
  this.port = this.port || null;

  this.connection = null;
}


HandlerSocket.prototype.openIndex = function(indexId, dbName, tableName, indexName, columns, cb){

  var connection;

  return cb(connection);

}