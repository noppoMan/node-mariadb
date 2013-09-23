var should = require('should')
, nodeMaria = require('../index')
;

describe('Node-mariadb testing', function(){

  describe('Driver HandlerSocket', function(){

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

    it('should connect mysql successfully to use handlersocket protocol.', function(){

      connection.on('connect', function(){
        should.be.ok(true);
      });

      connection.on('error', function(err){
        should.be.ok(false);
      });

    });


    it('should open index successfully and execute simple find.', function(){

      var expected = {
        'id': '1',
        'name': 'チャンタケ'
      }

      connection.openIndex(
        'hs'
        , 'test'
        , nodeMaria.HandlerSocket.PRIMARY
        , ['id', 'name']
        , function(err, hs){

          hs.find([1], function(err, data){
            JSON.stringify(data).should.equal(JSON.stringify(expected));
          });
      });

    })


  });

});