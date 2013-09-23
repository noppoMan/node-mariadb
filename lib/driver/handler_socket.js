var util = require('util')
, EventEmitter = require('events').EventEmitter
, Connection = require('../connection')
, async = require('async')
, settings = require('../settings')
;

module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';

//constants
var SEP = '\t';
var SIGNAL_SUCCESS = 0
  , SIGNAL_ABORT = 1
  , SIGNAL_FAILED = 2
;


//error message definiation.
var ERR_1 = 'Could not open index'
  , ERR_2 = 'Invalid option was given: '
;

//command prefix definiation.
var cmds = {
  OPEN_INDEX: 'P'
}


var _needsAutoIncrementIndexId = false;


function HandlerSocket(settings, options){
  EventEmitter.call(this);

  var self = this;
  
  if(options === undefined){
    options = {};
  }

  this.auth = settings.auth;
  this.indexId = 0;

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
    self.connection.end();
  });

}
util.inherits(HandlerSocket, EventEmitter);


HandlerSocket.prototype.setIndexId = function(id){
  this.indexId = id;
  _needsAutoIncrementIndexId = true;
}

HandlerSocket.prototype.openIndex = function(dbName, tableName, indexName, columns, fcolumns, cb){

  if(typeof fcolumns === 'function'){
    cb = fcolumns;
  }

  (_needsAutoIncrementIndexId) ? _needsAutoIncrementIndexId = false : this._incrementIndexId();

  var req = [cmds.OPEN_INDEX, this.indexId, dbName, tableName, indexName, columns.join(',')];

  if(typeof fcolumns === 'object'){
    req.push(fcolumns.join(','));
  }

  var self = this;

  this.connection.send(req, function(data){
    var res = data.split(SEP);
  
    if(res[0] == SIGNAL_ABORT)
    {
      cb(new Error(ERR_1), null);
      return;
    }
    else if(res[0] == SIGNAL_SUCCESS)
    {

      cb(null, new Index(self.connection, self.indexId, columns));
    }

  });

}

//increment reference value.
HandlerSocket.prototype._incrementIndexId = function(){
  this.indexId++;
}

function Index(connection, indexId, columns){
  EventEmitter.call(this);

  this.connection = connection;
  this.indexId = indexId;
  this.columns = columns;
}
util.inherits(Index, EventEmitter);

/*
* handlersocket basic commands
*/
Index.prototype.find = function(values, options, cb){

  //validate options
  if(options.limit){
    if(typeof options.limit != 'number')
      cb(new Error(ERR_2 + 'limit must be number'), null);
  }

  (typeof options == 'function') ? cb = options : options = {};
  
  //initialize operator.
  if(options.operator == undefined){
    options.operator = '=';
  }
  var self = this;
  var vlen = values.length;
  var req = [this.indexId, options.operator, vlen, values.join(',')];

  var filterFuncList = [
    function(parseResponse, cb){
      _getResultSetAsMap(parseResponse, self.columns, cb);
    }
  ];

  this.connection.send(req, function(data){
    handleResponse(data, filterFuncList, function(err, results){
      if(err){
        cb(err, null)
        return;
      }
      cb(null, results.resultSet);
    });
  });
}

Index.prototype.findModify = function(){

}

Index.prototype.auth = function(){

}

Index.prototype.insert = function(){

}

function handleResponse(res, filterList, done){
  var functionList = [
    function(cb){
      _parseResponse(res, cb)
    },
    function(parsed, cb){
      _errorHandler(parsed, cb);
    }
  ];
  for(var i in filterList){
    functionList.push(filterList[i]);
  }

  async.waterfall(functionList, function(err, data){
    if(err){
      done(err, null);
      return;
    }
    done(null, data);
  });
}

function _parseResponse(response, cb){
  
  var res = response.split(SEP);
  var code = res[0];
  var resultsLen = res[1];
  var resultSet = {};

  var results = [];
  for(var i in res){
    if(i <= 1) continue;
    results.push(res[i].replace(settings.LINE_END_STYLE, ''));
  }

  cb(null, {
    code:code,
    length:resultsLen,
    resultSet:results
  });

}

function _getResultSetAsMap(parsedResponse, columns, cb){
  var resultSet = {};
  for(var i in parsedResponse.resultSet){
    resultSet[columns[i]] = parsedResponse.resultSet[i];
  }
  //over write.
  parsedResponse.resultSet = resultSet;
  cb(null, parsedResponse);
}

function _errorHandler(parsedResponse, cb){

  if(parsedResponse.code != SIGNAL_SUCCESS){
    cb(new Error('Invalid parameter was sent.'), null);
    return;
  }
  cb(null, parsedResponse);
}





