var should = require('should')
, nodeMaria = require('../index')
;

var driverType = nodeMaria.DRIVER_TYPE_HANDLER_SOCKET
, host = 'localhost'
;

var settings = {
  driverType: driverType,
  host: host,
  port:9998,
  auth: {key: 'hogehoge'},
  options: {debug: true}
};

var wsSettings = {
  driverType: driverType,
  host: host,
  port:9999,
  auth: {key: 'fugafuga'},
  options: {debug: true}
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
            if(err)
              throw err;

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
            if(err)
              throw err;

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
            if(err)
              throw err;

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
            if(err)
              throw err;

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
            if(err)
              throw err;

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



    it('Should get results with filter', function(done){

      var expected1 = [
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
        , ['id']
        , function(err, hs){
            if(err)
              throw err;

          hs.find([1], {operator: '>', limit:1, filter:['id', '<=', 2]}, function(err, data){
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


    it('Should insert values successfully.', function(done){

      var expected1 = true;

      var con = nodeMaria.createConnection(wsSettings);

      con.on('connect', function(){
        con.openIndex(
        'node_mariadb_test'
        , 'node_mariadb_hs_test'
        , nodeMaria.HandlerSocket.PRIMARY
        , ['id', 'div', 'name']
        , function(err, hs){
            if(err)
              throw err;

          hs.insert([3, 2, 'Chloe'], function(err, data){
            if(err)
              throw err;
              
            data.should.equal(expected1);
            done();
            con.close();
          });
        });
      });
    });

  });
});