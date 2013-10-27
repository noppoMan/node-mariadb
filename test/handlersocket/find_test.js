var should = require('should')
, nodeMaria = require('../../index')
, testCase = require('../test_case')
;

//read settings.
var config = require('../config.json');

describe('Node-mariadb find testing', function(){

  before(function(done){
    testCase.setup(done);
  });

  after(function(done){
    testCase.tearDown(done);
  });

  describe('#find()', function(){

  	var dataProvider = [
  		{
        title: 'Should successfully find values.',
  			args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name']
          ],
          find: [
            [1]
          ]
        },
  			expected: 
        [
          {
            id: '1',
            name: 'Jack'
          }
        ]
  		},    
      {
        title: 'Should successfully find values with limit.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , 'division'
            , ['id', 'name']
          ],
          find: [
            [1]
            , {limit:2}
          ]
        },
        expected: 
        [
          {
            id: '1',
            name: 'Jack'
          },
          {
            id: '2',
            name: 'Tonny'
          }        
        ]
      },
      {
        title: 'Should successfully find values with limit and offset.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , 'division'
            , ['id', 'name']
          ],
          find: [
            [1]
            , {limit:1, offset:1}
          ]
        },
        expected: 
        [
          {
            id: '2',
            name: 'Tonny'
          }
        ]
      },
      {
        title: 'Should get empty array by values of not existing.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name']
          ],
          find: [
            [20000]
          ]
        },
        expected: []
      },
      {
        title: 'Should successfully find values with filter type F.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , 'division'
            , ['id', 'name', 'division']
            , ['division']
          ],
          find: [
            [0], {operator: '>', limit:3, filter:['id', '<=', 1]}
          ]
        },
        expected: 
        [
          {
            id: '1',
            name: 'Jack',
            division:1
          },      
          {
            id: '2',
            name: 'Tonny',
            division:1
          },
          {
            id: '4',
            name: 'Edgar',
            division:1
          }        
        ]
      },
      {
        title: 'Should get error with invalid arguments(lack 5th argument).',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name', 'division']
          ],
          find: [
            [1], {operator: '>', limit:1, filter:['id', '<=', 2]}
          ]
        },
        expected: Error
      },
      {
        title: 'Should get error with invalid arguments(Type of values is not an array.).',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name', 'division']
          ],
          find: [
            1, {operator: '>', limit:1, filter:['id', '<=', 2]}
          ]
        },
        expected: Error
      },      
      {
        title: 'Should successfully find values with filter type W.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , 'division'
            , ['id', 'name', 'division']
            , ['division']
          ],
          find: [
            [0], {operator: '>', limit:3, while: ['division', '<=', 1]}
          ]
        },
        expected: 
        [
          {
            id: '1',
            name: 'Jack',
            division:1
          },      
          {
            id: '2',
            name: 'Tonny',
            division:1
          },
          {
            id: '4',
            name: 'Edgar',
            division:1
          }        
        ]
      }    
  	]

  	dataProvider.forEach(function(testData){

  		it(testData.title, function(done){

  			var con = nodeMaria.createConnection(config.read);

        //Kill a error to try not to catch by mocha.
        con.on('error', function(){});

        testData.args.openIndex.push(function(err, hs){

          if(err) throw err;

          var cb = function(err, data){
            if(err){
              err.should.be.an.instanceOf(testData.expected);
            }else{
              should.deepEqual(data, testData.expected);
            }
            con.close();
            done();
          };

          testData.args.find.push(cb);
          hs.find.apply(hs, testData.args.find);
        });

  			con.on('connect', function(){
          con.openIndex.apply(con, testData.args.openIndex)
        });
  		});
  	});
  });

  describe('#findIn()', function(){

    var dataProvider = [
      {
        title: 'Should successfully find values with findIn.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name']
          ],
          find: [
            [1,2], {limit:2}
          ]
        },
        expected: 
        [
          {
            id: '1',
            name: 'Jack'
          },
          {
            id: '2',
            name: 'Tonny'
          }          
        ]
      },
      {
        title: 'Should get empty array by values of not existing on mariadb.',
        args:{
          openIndex: [
            config.read.dbName
            , 'node_mariadb_hs_test'
            , nodeMaria.HandlerSocket.PRIMARY
            , ['id', 'name']
          ],
          find: [
            [100, 300, 500]
          ]
        },
        expected: []
      }
    ]

    dataProvider.forEach(function(testData){

      it(testData.title, function(done){

        var con = nodeMaria.createConnection(config.read);

        //Kill a error to try not to catch by mocha.
        con.on('error', function(){});

        testData.args.openIndex.push(function(err, hs){

          if(err) throw err;

          var cb = function(err, data){
            if(err){
              err.should.be.an.instanceOf(testData.expected);
            }else{
              should.deepEqual(data, testData.expected);
            }
            con.close();
            done();
          };

          testData.args.find.push(cb);
          hs.findIn.apply(hs, testData.args.find);
        });

        con.on('connect', function(){
          con.openIndex.apply(con, testData.args.openIndex)
        });
      });
    });
  });

});