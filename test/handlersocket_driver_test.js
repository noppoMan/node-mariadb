var should = require('should')
, nodeMaria = require('../index')
;

var settings = {
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9998,
  options:
  {
    debug:true
  }
};

describe('Node-mariadb testing', function(){

  describe('Testing of HandlerSocket driver', function(){

    it('Should connect handlersocket port successfully', function(done){
      var con = nodeMaria.createConnection(settings);
      con.on('connect', function(){
        true.should.be.ok;
        done();
      });
    });

    it('Should catch close event when end() is called.', function(done){
      var con = nodeMaria.createConnection(settings);
      con.on('connect', function(){
        con.close();
      });
      con.on('close', function(err){
        true.should.be.ok;
        done();
      });
    });

    it('Should catch error event, if mariadb server is not responded.', function(done){
      var con = nodeMaria.createConnection({
        driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
        host:'unknownhost',
        port:9998,
        options:
        {
          debug:true
        }
      });

      con.on('error', function(err){
        err.should.be.an.instanceof(Error)
        done();
      });
    });

    it('Should execute find method parallelly.', function(done){

      var con = nodeMaria.createConnection(settings);

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
              done();
              con.close();
            });
        });      
      });
    });

    it('Should get results with limit, offset options.', function(done){

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

      var con = nodeMaria.createConnection(settings);

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
            done();
            con.close();
          });
        });
      });     
    });
    
    it('Should get results with findIn method', function(done){

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

      var con = nodeMaria.createConnection(settings);

      con.on('connect', function(){
        con.openIndex(
        'node_mariadb_test'
        , 'node_mariadb_hs_test'
        , nodeMaria.HandlerSocket.PRIMARY
        , ['id', 'div', 'name']
        , function(err, hs){
          hs.findIn([1,2], {limit:2}, function(err, data){
            if(err){
              console.log(err);
            }
            JSON.stringify(data).should.equal(JSON.stringify(expected1));
            done();
            con.close();
          });
        });
      });
    });

  });
});