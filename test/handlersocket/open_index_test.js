var should = require('should')
, nodeMaria = require('../../index')
, testCase = require('../test_case')
;
//read settings.
var config = require('../config.json');
describe('Node-mariadb Handlersocket.openIndex testing', function(){

    before(function(done){
        testCase.setup(done);
    });
    
    after(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully open index.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ]
            },
            expected: 1
        },
        {
            title: 'Should get error with illegal databse name.',
            args:{
                openIndex: [
                    'New_York'
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ]
            },
            expected: Error
        },
        {
            title: 'Should get error with illegal table name.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'hogehoge'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name']
                ]
            },
            expected: Error
        },
        {
            title: 'Should get error with illegal index name.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'hogehoge'
                    , ['id', 'name']
                ]
            },
            expected: Error
        },
        {
            title: 'Should get error with illegal value.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'hoge']
                ]
            },
            expected: Error
        }
    ]
    dataProvider.forEach(function(testData){
        it(testData.title, function(done){
            var con = nodeMaria.createConnection(config.read);
            //Kill a error to try not to catch by mocha.
            con.on('error', function(){});
            testData.args.openIndex.push(function(err, hs){
                if(err){
                    err.should.be.an.instanceOf(testData.expected);
                }else{
                    hs.indexId.should.equal(testData.expected);
                }
                con.close();
                done();
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});