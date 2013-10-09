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

        var expected = [
          {
            id: '1',
            name: 'Jack'
          }
          ];

        var expected2 = [
          {
            id: '2',
            name: 'Tonny'
          }
        ];

      con.on('connect', function(){
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

    it('limit, offset options testing', function(){

      var expected1 = [
        {
          id: '1',
          div:'1',
          name: 'Jack'
        },
        {
          id: '2',
          div:'1',
          name: 'Tonny'
        }
      ];

      var expected2 = [
        {
          id: '2',
          div:'1',
          name: 'Tonny'
        }
      ];


      var con = nodeMaria.createConnection(settigs);

      con.on('connect', function(){

        con.openIndex(
        'node_mariadb_test'
        , 'node_mariadb_hs_test'
        , 'div'
        , ['id', 'div', 'name']
        , function(err, hs){
          hs.find([1], {limit:2}, function(err, data){
            JSON.stringify(data).should.equal(JSON.stringify(expected1));
          });
        });


       con.openIndex(
        'node_mariadb_test'
        , 'node_mariadb_hs_test'
        , 'div'
        , ['id', 'div', 'name']
        , function(err, hs){
          hs.find([1], {limit:1, offset:1}, function(err, data){
            JSON.stringify(data).should.equal(JSON.stringify(expected2));
          });
        });


      });
    })
  });
});