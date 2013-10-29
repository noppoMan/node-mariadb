var util = require('util')
, EventEmitter = require('events').EventEmitter
, Connection = require('../connection')
, utility = require('../utility')
;

module.exports = HandlerSocket;

//static properties
HandlerSocket.PRIMARY = 'PRIMARY';

//constants
var SEP = '\t', DATA_END_LETTER = '\n';

//order definiation.
var orders= {
    AUTH: 'A',
    OPEN_INDEX: 'P',
    FILTER: 'F',
    WHILE: 'W',
    IN : '@',
    MOD: {
        UPDATE: 'U',
        DELETE: 'D',
        INCREMENT: '+',
        DECREMENT: '-',
        UPDATE_GET: 'U?',
        DELETE_GET: 'D?',
        INCREMENT_GET: '+?',
        DECREMENT_GET: '-?'
    }
}

function HandlerSocket(settings, options){
    EventEmitter.call(this);

    var self = this;

    if(options === undefined){
        options = {};
    }

    this.auth = {
        type: 1
    };

    this.enableAuthentication = false;

    if(settings.auth){
        this.enableAuthentication = true;
        this.auth.key = settings.auth.key;
    }

    this.connection = new Connection(settings, options);

    self.indexId = 0;

    //request encoder for handlersocket protocol.
    this.connection.encodeRequest = function(req){
        return req.join(SEP) + DATA_END_LETTER;
    }

    this.connection.handleResponse = function(err, res, errMsg, cb){
        var data = res.split(SEP).join(',').replace(/\u0001[\x40-\x4F]/g, function(ch) {
            return String.fromCharCode(ch.charCodeAt(1) - 0x40);
        }).split(',');
        
        if(err || data[0] != 0){
            err = err ? err : new Error(errMsg + ' code: ' + data.join(','));
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

    Object.keys(this.connection._sock._events).forEach(function(evName){
        self.connection.on(evName, function(d){
            self.emit(evName, d);
        });
    });
}
util.inherits(HandlerSocket, EventEmitter);

//increment reference value.
HandlerSocket.prototype._incrementIndexId = function(){
    this.indexId++;
}

HandlerSocket.prototype._auth = function(cb){
    var self = this;
    if(!this.enableAuthentication){
        cb();
    }else{
        var next = function(err, data){
        self.connection.handleResponse(err, data, 'Authentication Error.'
            ,function(err, data){
                cb(err, data);
            });
        }
        this.connection.send([orders.AUTH, this.auth.type, this.auth.key], next);
    }
}

HandlerSocket.prototype.openIndex = function(dbName, tableName, indexName, columns, fcolumns, cb){
    var self = this;
    
    if(typeof fcolumns === 'function'){
        cb = fcolumns;
    }

    self._incrementIndexId();

    var indexId = self.indexId;
    var req = [orders.OPEN_INDEX, indexId, dbName, tableName, indexName, columns.join(',')];

    if(typeof fcolumns === 'object'){
        req.push(fcolumns.join(SEP));
    }

    var next = function(err, res){
     self.connection.handleResponse(err, res, 'Could not open index.'
        ,function(err, data){
            cb(err, err ? null : new Index(self.connection, indexId, columns));
        });
    }

    this._auth(function(){
        self.connection.send(req, next);
    });
}

HandlerSocket.prototype.close = function(){
    this.connection.close();
}

Index.DEFAULT_OPERATOR = '=';

function Index(connection, indexId, columns){
    this.connection = connection;
    this.indexId = indexId;
    this.columns = columns;

    this.find = this._exec.bind(this, null);
    this.update = this._exec.bind(this, 'UPDATE');
    this.delete = this._exec.bind(this, 'DELETE');
    this.increment = this._exec.bind(this, 'INCREMENT');
    this.decrement = this._exec.bind(this, 'DECREMENT');
    this.updateGet = this._exec.bind(this, 'UPDATE_GET');
    this.deleteGet = this._exec.bind(this, 'DELETE_GET');
    this.incrementGet = this._exec.bind(this, 'INCREMENT_GET');
    this.decrementGet = this._exec.bind(this, 'DECREMENT_GET');
}

Index.prototype.insert = function(values, cb){
    var self = this;
    var next = function(err, res){
        self.connection.handleResponse(err, res, 'Insert failed.'
        , function(err, data){
            cb(err, err ? null : true);
        });
    }
    this.connection.send([this.indexId, '+' , values.length, values.join(SEP)], next);
}

Index.prototype._exec = function(order, values, options, cb){
    if(typeof options === 'function'){
        cb = options;
        options = {};
    }
    if(typeof values !== 'object'){
        cb(new Error('The argument of values should be an array.'), null);
        return;
    }

    var operator = options.operator || Index.DEFAULT_OPERATOR;
    var self = this;
    var req = [this.indexId, operator].concat(_createRequest(order, values, options));
    var columns = self.columns;
    
    var next = function(err, res){
        self.connection.handleResponse(err, res, 'find failed.'
        , function(err, data){
            var parseDataToResults = function(){
                if(!_isModOrder(order) || orders.MOD[order].indexOf('?') !== -1)
                    return assignKey(columns, resultsToArray(data));
                return parseInt(data.slice(2)[0]);
            };
            cb( err, err ? null : parseDataToResults());
        });
    }

    this.connection.send(req, next);
}

function _createRequest(order, values, options){
    var addReq = [];
    var limit = options.limit || 1;
    var offset = options.offset || 0;

    if(values.in) {
        addReq = addReq.concat([1, '', limit, offset, orders.IN, 0, values.in.length, values.in.join(SEP)]);
    } else {
        addReq = addReq.concat([values.length, values.join(SEP), limit, offset]);
    }

    addReq = addReq.concat(_addFilterRequest(options), _addModRequest(order, options));

    return addReq;
}

function _addFilterRequest(options){
    if(options.filter){
        return [orders.FILTER, options.filter[1], options.filter[0], options.filter[2]];
    }
    if(options.while){
        return [orders.WHILE, options.while[1], options.while[0], options.while[2]];
    }
    return [];
}

function _isModOrder(order){
    return orders.MOD.hasOwnProperty(order) === true;
}

function _addModRequest(order, options){
    var mv = '';
    if(options['+']) {

        mv = options['+'];

    } else if (options['-']){

        mv = options['-'];

    } else if(options.set) {

        mv = options.set.join(SEP);

    }

    if(_isModOrder(order)){
        return [orders.MOD[order], mv];
    }
    return [];
}

function resultsToArray(data){
    var vlen = parseInt(data[1])
    , values = data.slice(2)
    , loopCount = values.length / vlen
    , begin = 0
    , end = vlen
    , returnValues = [];

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