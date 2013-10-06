var should = require('should')
, nodeMaria = require('../index')
;

var settigs = {
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9998,
  options:
  {
    debug:true,
    connectionAutoClose:false
  }
};

describe('Node-mariadb testing', function(){

  describe('Testing of HandlerSocket driver', function(){

    it('Should connect handlersocket port successfully', function(){
      var con = nodeMaria.createConnection(settigs);
      con.on('connect', function(){
        true.should.be.ok;
      });
    });


    it('Should execute find method parallelly.', function(){

      var con = nodeMaria.createConnection(settigs);

      con.on('connect', function(){
        var expected = {
          id: '1',
          name: 'Jack'
        }

        var expected2 = {
          id: '2',
          name: 'Tonny'
        }      

        con.openIndex(
          'node_mariadb_test'
          , 'node_mariadb_hs_test'
          , nodeMaria.HandlerSocket.PRIMARY
          , ['id', 'name']
          , function(err, hs){
            hs.find([1], function(err, data){
              JSON.stringify(data).should.equal(JSON.stringify(expected));
            });
        });

        con.openIndex(
          'node_mariadb_test'
          , 'node_mariadb_hs_test'
          , nodeMaria.HandlerSocket.PRIMARY
          , ['id', 'name']
          , function(err, hs){
            hs.find([2], function(err, data){
              JSON.stringify(data).should.equal(JSON.stringify(expected2));
            });
        });
      });
    });
  });
});