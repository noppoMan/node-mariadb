var should = require('should')
, nodeMaria = require('../../index')
, fs = require('fs')
, testCase = require('../test_case')
;
//read settings.
var config = require('../config.json');
describe('Node-mariadb Handlersocket.update testing', function(){
    
    beforeEach(function(done){
        testCase.setup(done);
    });

    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully update a single row.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name', 'division']
                ],
                update: [
                    [1], {set: [1, 'John', 1]}
                ]
            },
            config:'write',
            expected: 1
        },
        {
            title: 'Should successfully update multiple data with limit and offset.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                update: [
                    [1], {set: [3], limit:2, offset:1}
                ]
            },
            config:'write',
            expected: 2
        },
        {
            title: 'Should successfully update multiple data with filter.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                    , ['division']
                ],
                update: [
                    [0], {set: [3], operator:'>', filter:['division', '<=', 1], limit: 3}
                ]
            },
            config:'write',
            expected: 3
        },
        {
            title: 'Should successfully update with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                update: [
                    {in:[1, 2]}, {set: [5], limit: 5}
                ]
            },
            config:'write',
            expected: 2
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
                testData.args.update.push(cb);
                hs.update.apply(hs, testData.args.update);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.updateGet testing', function(){
    
    beforeEach(function(done){
        testCase.setup(done);
    });
    
    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully update a single row.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id', 'name', 'division']
                ],
                update: [
                    [1], {set: [1, 'John', 1]}
                ]
            },
            config:'write',
            expected: [
                {
                    "id":"1",
                    "name":"Jack",
                    "division":"1"
                }
            ]
        },
        {
            title: 'Should successfully update multiple data with limit and offset.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                update: [
                    [1], {set: [3], limit:2, offset:1}
                ]
            },
            config:'write',
            expected: [
                {
                    "division":"1"
                },
                {
                    "division":"1"
                }
            ]
        },
        {
            title: 'Should successfully update multiple data with filter.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                    , ['division']
                ],
                update: [
                    [0], {set: [3], operator:'>', filter:['division', '<=', 1], limit: 3}
                ]
            },
            config:'write',
            expected: [
                {
                    "division":"1"
                },
                {
                    "division":"1"
                },
                {
                    "division":"1"
                }
            ]
        },
        {
            title: 'Should successfully update with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                update: [
                    {in:[1, 2]}, {set: [5], limit: 5}
                ]
            },
            config:'write',
            expected: [
                {
                    "division":"1"
                },
                {
                    "division":"2"
                }
            ]
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
                testData.args.update.push(cb);
                hs.updateGet.apply(hs, testData.args.update);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.delete testing', function(){
    
    beforeEach(function(done){
        testCase.setup(done);
    });
    
    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully delete a data of id equals 1.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    [1]
                ]
            },
            config:'write',
            expected: 1
        },
        {
            title: 'Should successfully delete multiple data with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    {in: [1, 2, 3]}, {limit: 3}
                ]
            },
            config:'write',
            expected: 3
        },
        {
            title: 'Should successfully delete a data of id equals 1.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    [1]
                ]
            },
            config:'write',
            expected: 1
        },
        {
            title: 'Should successfully delete multiple data with limit.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                delete: [
                    [1], {limit: 3}
                ]
            },
            config:'write',
            expected: 3
        },
        {
            title: 'Should successfully delete multiple data with filter.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                    , ['id']
                ],
                delete: [
                    [1], {operator:'>', limit: 2, filter:['id', '<=', 3]}
                ]
            },
            config:'write',
            expected: 2
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
                testData.args.delete.push(cb);
                hs.delete.apply(hs, testData.args.delete);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.deleteGet testing', function(){

    beforeEach(function(done){
        testCase.setup(done);
    });

    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully delete a data of id equals 1.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    [1]
                ]
            },
            config:'write',
            expected: [
                {
                    id: 1
                }
            ]
        },
        {
            title: 'Should successfully delete multiple data with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    {in: [1, 2, 3]}, {limit: 3}
                ]
            },
            config:'write',
            expected: [
                {
                    "id":"1"
                },
                {
                    "id":"2"
                },
                {
                    "id":"3"
                }
            ]
        },
        {
            title: 'Should successfully delete a data of id equals 1.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                ],
                delete: [
                    [1]
                ]
            },
            config:'write',
            expected: [
                {
                    id : 1
                }
            ]
        },
        {
            title: 'Should successfully delete multiple data with limit.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                delete: [
                    [1], {limit: 3}
                ]
            },
            config:'write',
            expected: [
                {
                    "division":"1"
                }
                ,{
                    "division":"1"
                },
                {
                    "division":"1"
                }
            ]
        },
        {
            title: 'Should successfully delete multiple data with filter.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , nodeMaria.HandlerSocket.PRIMARY
                    , ['id']
                    , ['id']
                ],
                delete: [
                    [1], {operator:'>', limit: 2, filter:['id', '<=', 3]}
                ]
            },
            config:'write',
            expected: [
                {
                    "id":"2"
                },
                {
                    "id":"3"
                }
            ]
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
                testData.args.delete.push(cb);
                hs.deleteGet.apply(hs, testData.args.delete);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.increment testing', function(){
    beforeEach(function(done){
        testCase.setup(done);
    });
    afterEach(function(done){
        testCase.tearDown(done);
    });
    var dataProvider = [
        {
            title: 'Should successfully increment division num from 1 to 2',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                increment: [
                    [1], {'+': 1}
                ]
            },
            config:'write',
            expected: 1
        },
        {
            title: 'Should successfully increment multiple rows with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                increment: [
                    {in: [1, 2]}, {'+': 1, limit:2}
                ]
            },
            config:'write',
            expected: 2
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
                testData.args.increment.push(cb);
                hs.increment.apply(hs, testData.args.increment);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.incrementGet testing', function(){
    
    beforeEach(function(done){
        testCase.setup(done);
    });

    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully increment division num from 1 to 2',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                increment: [
                    [1], {'+': 1}
                ]
            },
            config:'write',
            expected:    [
                {
                    "division": "1"
                }
            ]
        },
        {
            title: 'Should successfully increment multiple rows with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                increment: [
                    {in: [1, 2]}, {'+': 1, limit:2}
                ]
            },
            config:'write',
            expected: [{"division":"1"},{"division":"2"}]
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
                testData.args.increment.push(cb);
                hs.incrementGet.apply(hs, testData.args.increment);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.decrement testing', function(){
    
    beforeEach(function(done){
        testCase.setup(done);
    });

    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully decrement division num from 1 to 0',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                decrement: [
                    [1], {'-': 1}
                ]
            },
            config:'write',
            expected: 1
        },
        {
            title: 'Should successfully decrement multiple rows with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                decrement: [
                    {in: [1, 2]}, {'-': 1, limit:2}
                ]
            },
            config:'write',
            expected: 2
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
                testData.args.decrement.push(cb);
                hs.decrement.apply(hs, testData.args.decrement);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});

describe('Node-mariadb Handlersocket.decrementGet testing', function(){

    beforeEach(function(done){
        testCase.setup(done);
    });

    afterEach(function(done){
        testCase.tearDown(done);
    });

    var dataProvider = [
        {
            title: 'Should successfully decrement division num from 1 to 0',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                decrement: [
                    [1], {'-': 1}
                ]
            },
            config:'write',
            expected:    [
                {
                    "division": "1"
                }
            ]
        },
        {
            title: 'Should successfully decrement multiple rows with in clause.',
            args:{
                openIndex: [
                    config.read.dbName
                    , 'node_mariadb_hs_test'
                    , 'division'
                    , ['division']
                ],
                decrement: [
                    {in: [1, 2]}, {'-': 1, limit:2}
                ]
            },
            config:'write',
            expected: [{"division":"1"},{"division":"2"}]
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
                testData.args.decrement.push(cb);
                hs.decrementGet.apply(hs, testData.args.decrement);
            });
            con.on('connect', function(){
                con.openIndex.apply(con, testData.args.openIndex)
            });
        });
    });
});