var util = require('util')
, EventEmitter = require('events').EventEmitter
, Connection = require('../connection')
, async = require('async')
;

module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';

//constants
var SEP = '\t', DATA_END_LETTER = '\n';

//command definiation.
var cmds = {
  OPEN_INDEX: 'P',
  FILTER: "F",
  WHILE: "W"
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
  this.connection.encodeRequest = function(req){
    return req.join(SEP) + DATA_END_LETTER;
  }
  
  this.connection.handleResponse = function(err, res, errMsg, cb){
    var data = res.split(SEP).join(',').replace(/\u0001[\x40-\x4F]/g, function(ch) {
      return String.fromCharCode(ch.charCodeAt(1) - 0x40);
    }).split(',');

    if(err || data[0] != 0){
      err = err ? err : new Error(errMsg || '' + ' Error: ' + data[2]);
      cb(err, null);
      self.emit('error', err);
      return;
    }

    cb(null, data);
  }

  this.connection.onData = function(data){
    if (data) {
      var received = self.connection.received + data;
      var found;
      while ((found = received.indexOf(DATA_END_LETTER)) !== -1) {
        var response = received.substring(0, found + 1);
        received = received.substring(found + 1);
        var next = self.connection.enQueue.shift();

        next(null, response.substring(0, response.length -1));
      }
      self.connection.received = received;
    }
  };
  
  for(var evName in this.connection._sock._events){
    this.connection.on(evName, function(d){
      self.emit(evName, d);
    });
  }

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
   self.connection.handleResponse(err, res, 'Could not open index.'
    ,function(err, data){
      cb(err, (err) ? null : new Index(self.connection, indexId, columns));
    });
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
  this._finder(values, options, cb);
}

Index.prototype.findIn = function(values, options, cb){
  options.inClause = ['@', 0, values.length, values.join(SEP)];
  this._finder([], options, cb);
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

  if(options.inClause){
    req = req.concat(options.inClause);
  }

  if(options.filter){
    req = req.concat(options.filter);
  }

  var columns = self.columns;
  var next = function(err, res){
    self.connection.handleResponse(err, res, 'find failed.'
    , function(err, data){
      cb(null, err ? null : assignKey(columns, resultsToArray(data)));
    });
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