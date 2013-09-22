var should = require('should')
, nodeMaria = require('../index')
;


describe('Connection testing', function(){

  describe('Driver HandlerSocket', function(){

    it('should connect mysql successfully to use handlersocket protocol.', function(){

      var connection = nodeMaria.createConnection({
        driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
        host:'localhost',
        port:9998,
        options:
        {
          debug:true,
          connectionAutoClose:false
        }
      });

      connection.on('connect', function(){
        console.log('Connected successfully');
      });

      connection.on('error', function(err){
        console.log(err);
      });

      connection.openIndex();

      /*
      client.on('close', function(){
        console.log('close');
      });
      */


    });

  });

});