var should = require('should')
, nodeMaria = require('../../index')
, fs = require('fs')
, testCase = require('../test_case')
;
//read settings.
var config = require('../config.json');
describe('Node-mariadb    Handlersocket.insert testing', function(){
    
    before(function(done){
        testCase.setup(done);
    });
    after(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully insert data.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ],
                insert: [
                    [5, 2, 'Terry', '2013-07-22 00:00:00', '2013-07-22 00:00:00']
                ]
            },
            config:'write',
            expected: true
        },
        {
            title: 'Should get duplicate entry error.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ],
                insert: [
                    [5, 2, 'Terry', '2013-07-22 00:00:00', '2013-07-22 00:00:00']
                ]
            },
            config:'write',
            expected: Error
        },
        {
            title: 'Should get error with read only port connection.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ],
                insert: [
                    [6, 3, 'Bill', '2013-07-22 00:00:00', '2013-07-22 00:00:00']
                ]
            },
            config:'read',
            expected: Error
        }
    ]
    dataProvider.forEach(function(testData){
        it(testData.title, function(done){
            var con = nodeMaria.createConnection(config[testData.config]);
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
                    done();
                    con.close();
                };
                testData.args.insert.push(cb);
                hs.insert.apply(hs, testData.args.insert);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});