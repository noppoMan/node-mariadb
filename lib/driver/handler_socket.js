var util = require('util')
, EventEmitter = require('events').EventEmitter
//, Connection = require('../connection')
, async = require('async')
, net = require('net')
;

module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';

//constants
var SEP = '\t', DATA_END_LETTER = '\n';

//command definiation.
var cmds = {
  OPEN_INDEX: 'P'
}

var enQueue = [];

function Connection(settings, options){
  EventEmitter.call(this);

  var self = this;

  this.host = settings.host || 'localhost';
  this.port = settings.port || 3306;
  this.timeout = settings.timeout || 120;
  this.received = '';

  this.RETRY_CONNECT_INTERVAL = 3000;

  this._sock = new net.Socket({ allowHalfOpen: true });
  //Force set encoding as utf8
  this._sock.setEncoding('utf8');

  //connect to host:port
  this._sock.connect(this.port, this.host);

  this._sock.on('connect', function() {
    self.emit('connect');
  });

  this._sock.on('data', function(data){
    if (data) {
      var received = self.received + data;
      var found;
      while ((found = received.indexOf(DATA_END_LETTER)) !== -1) {
        var response = received.substring(0, found + 1);
        received = received.substring(found + 1);
        var next = enQueue.shift();

        next(null, self._parseResponse(response.substring(0, response.length -1)));
      }
      self.received = received;
    }
  });

  this._sock.on('close', function(err) {
    self.emit('close', err);
  });

  this._sock.on('error', function(err) {
    self.emit('error', err);
  });

  this._sock.on('timeout', function(err) {
    self.emit('timeout', err);
  });

  this._encodeRequest = function(req){
    return req;
  }

  this._parseResponse = function(res){
    return res;
  }

}
util.inherits(Connection, EventEmitter);

Connection.prototype.send = function(req, cb){

  if(this._sock.readyState != 'open'){
    process.nextTick(function() {
      callback(new Error('Can not write packet due to the socket closed.'));
    });
    return;
  }

  var encoded = this._encodeRequest(req);
  var self = this;

//console.log(encoded);

  self._sock.write(encoded, 'utf-8');
  enQueue.push(cb);
}


/**
* send heartbeat to the server maintain connection.
*/
Connection.prototype.heartbeat = function(cb){
  var self = this;
  this.on('error', function(err){
    if(err.code == 'ECONNREFUSED'){
      console.log('MariaDB server('+self.host + ':' + self.port + ') is not responding. Retry to connect....');
      setTimeout(function(){
        self._sock.connect(self.port, self.host);
      }, self.RETRY_CONNECT_INTERVAL);
    }
  });
}


Connection.prototype.close = function(cb){
  this._sock.end();
}



function HandlerSocket(settings, options){
  EventEmitter.call(this);

  var self = this;
  
  if(options === undefined){
    options = {};
  }

  this.auth = settings.auth;
  this.indexId = 0;

  this.connection = new Connection(settings, options);

  //request encoder for handlersocket protocol.
  this.connection._encodeRequest = function(req){
    return req.join(SEP) + DATA_END_LETTER;
  }

  //response parser for handlersocket protocol.
  this.connection._parseResponse = function(res){
    var data = res.split(SEP).join(',').replace(/\u0001[\x40-\x4F]/g, function(ch) {
      return String.fromCharCode(ch.charCodeAt(1) - 0x40);
    }).split(',');

    return data;
  }

  //override events
  this.connection.on('connect', function(){
    self.emit('connect');
  });
}
util.inherits(HandlerSocket, EventEmitter);

//increment reference value.
HandlerSocket.prototype._incrementIndexId = function(){
  this.indexId++;
}


HandlerSocket.prototype.openIndex = function(dbName, tableName, indexName, columns, fcolumns, cb){

  var self = this;

  if(typeof fcolumns === 'function'){
    cb = fcolumns;
  }

  self._incrementIndexId();
  var indexId = self.indexId;
  var req = [cmds.OPEN_INDEX, indexId, dbName, tableName, indexName, columns.join(',')];
  
  if(typeof fcolumns === 'object'){
    req.push(fcolumns.join(','));
  }
  
  var next = function(err, res){
    handleResponse(err, res, 'Could not open index',function(){
      return new Index(self.connection, indexId, columns);
    },cb);
  }
  this.connection.send(req, next);

}


Index.DEFAULT_OPERATOR = '=';

function Index(connection, indexId, columns){

  EventEmitter.call(this);

  this.connection = connection;
  this.indexId = indexId;
  this.columns = columns;
  this.requestOptions = [];
}
util.inherits(Index, EventEmitter);


Index.prototype.find = function(values, options, cb){
  this._finder(values, options, cb);
}

Index.prototype.findIn = function(values, options, cb){
  //@ <icol> <ivlen> <iv1> ... <ivn>
  this.requestOptions = this.requestOptions.concat(['@', 0, values.length, values.join(SEP)]);
  this.find([], options, cb);
}



Index.prototype._finder = function(values, options, cb){

  if(typeof options === 'function'){
    cb = options;
    options = {};
  }

  var limit = options.limit || 1;
  var offset = options.offset || 0;

  var operator = options.operator || Index.DEFAULT_OPERATOR;
  var self = this;
  var vlen = values.length || 1;
  var req = [this.indexId, operator, vlen, values.join(SEP), limit, offset];

  if(this.requestOptions.length > 0){
    req = req.concat(this.requestOptions);
  }

  var columns = self.columns;
  var next = function(err, res){
    handleResponse(err, res, 'Error occured', function(){
      return assignKey(columns, resultsToArray(res));
    }, cb);
  }

  this.connection.send(req, next);

}


function resultsToArray(data){
  var vlen = data[1];
  var values = data.slice(2);
  var loopCount = values.length / vlen;
  var begin = 0;
  var end = vlen;
  var returnValues = [];
  for(var i =0; i < loopCount; i++){
    returnValues.push(values.slice(begin, end));
    begin+= vlen;
    end+= vlen;
  }
  return returnValues;
}

function assignKey(keyList, data){
  var resultSet = [];
  for(var i in data){
    for(var j in data[i]){
      if(resultSet[i] == undefined){
        resultSet[i] = {};
      }
      resultSet[i][keyList[j]] = data[i][j];
    }
  }
  return resultSet;
}


function handleResponse(err, res, errMsg, responsePraser, cb){
  if(err){
    cb(err, null);
    return;
  }

  if(res[0] == 1 || res[0] == 2){
    cb(new Error(errMsg + ': ' + res[2]), null);
    return;
  }

  cb(null, responsePraser());
}






