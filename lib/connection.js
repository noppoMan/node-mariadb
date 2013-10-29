var util = require('util')
, EventEmitter = require('events').EventEmitter
, async = require('async')
, net = require('net')
;

module.exports = Connection;

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
    this._sock.setTimeout(this.timeout);
    this.enQueue = [];

    //connect to host:port
    this._sock.connect(this.port, this.host);
    this._sock.on('connect', function() {
        self.emit('connect');
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

    this._sock.on('data', function(data){
        self.onData(data);
    });

    this.onData = function(data){}

    //interfaces
    this.encodeRequest = function(req){}
    this.handleResponse = function(err, res, costomeErrMsg, cb){}
}
util.inherits(Connection, EventEmitter);

Connection.prototype.send = function(req, cb){
    if(this._sock.readyState != 'open'){
        process.nextTick(function() {
            cb(new Error('Can not write packet due to the socket closed.'));
        });
        return;
    }

    var encoded = this.encodeRequest(req);
    var self = this;
    self._sock.write(encoded, 'utf-8');
    self.enQueue.push(cb);
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