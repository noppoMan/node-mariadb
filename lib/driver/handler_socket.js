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
var SEP = '\t', STATEMENT_END = '\n';
var SIGNAL_OK = 0
  , SIGNAL_ABORT = 1
  , SIGNAL_STMTNUM = 2
;

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

  this.RETRY_CONNECT_INTERVAL = 3000;

  this.connectionAutoClose = options.connectionAutoClose || false;

  this._sock = new net.Socket({ allowHalfOpen: true });
  //Force set encoding as utf8
  this._sock.setEncoding('utf8');

  //connect to host:port
  this._sock.connect(this.port, this.host);

  this._sock.on('connect', function() {
    if(settigs.options.debug){
      console.log('MariaDB server('+self.host + ':' + self.port + ') successfully connected.');
    }
    self.emit('connect');
  });

  this._sock.on('data', function(res){
    var data = res.split(STATEMENT_END);

    if(data.length > 2){
      for(var i  in data){
        if(i >= data.length -1){ 
          break 
        };
        var next = enQueue.shift();
        next(null, self._parseResponse(data[i]));
      }
      return;
    }

    var next = enQueue.shift();
    next(null, self._parseResponse(data[0]));
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

  this.heartbeat();

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
    return req.join(SEP) + STATEMENT_END;
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
  
  var next = function(error, data){

    if(data[0] == SIGNAL_ABORT)
    {
      cb(new Error('Could not open index'), null);
      return;
    }
    else if(data[0] == SIGNAL_OK)
    {
      cb(null, new Index(self.connection, indexId, columns));
    }
  }

  this.connection.send(req, next);

}


Index.DEFAULT_OPERATOR = '=';

function Index(connection, indexId, columns){

  EventEmitter.call(this);

  this.connection = connection;
  this.indexId = indexId;
  this.columns = columns;
}
util.inherits(Index, EventEmitter);


Index.prototype.find = function(values, options, cb){

  if(typeof options === 'function'){
    cb = options;
    options = {};
  }

  var limit = options.limit || 1;
  var offset = options.offset || 0;


  var operator = options.operator || Index.DEFAULT_OPERATOR;
  var self = this;
  var vlen = values.length;
  var req = [this.indexId, operator, vlen, values.join(','), limit, offset];
  var columns = self.columns;

  function toArray(data){
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

  function assignKey(data){
    var resultSet = [];
    for(var i in data){
      for(var j in data[i]){
        if(resultSet[i] == undefined){
          resultSet[i] = {};
        }
        resultSet[i][columns[j]] = data[i][j];
      }
    }
    return resultSet;
  }

  var next = function(err, res){
    cb(err, assignKey(toArray(res)));
  }
  this.connection.send(req, next);
}



var settigs = {
  host:'localhost',
  port:9998,
  options:
  {
    debug:true,
    connectionAutoClose:false
  }
};


new HandlerSocket(settigs);
