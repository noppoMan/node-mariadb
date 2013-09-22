var should = require('should')
, nodeMaria = require('../index')
;


describe('Connection testing', function(){

  describe('Driver HandlerSocket', function(){

    it('should connect mysql successfully to use handlersocket protocol.', function(){


      var client = nodeMaria.createConnection({
        driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
        debug:true
      });

      client.on('connect', function(){
        console.log('Connected successfully');

        client.close();

      });

      client.on('close', function(){
        console.log('close');
      });


    });

  });

});