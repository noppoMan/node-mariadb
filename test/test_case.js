var mysql = require('mysql')
, async = require('async');

//read settings.
var config = require('./config.json');
var fixture = require('./fixtures/node_mariadb_hs_test')
var connection = null;

function getConnection(){
    if(connection == null){

        connection = mysql.createConnection({
            host         : config.mysqld.host,
            user         : config.mysqld.user,
            password : config.mysqld.password,
            database: config.mysqld.database
        });
        
        connection.connect();
    }
    return connection;
}

exports.setup = function(done){
    var connection = getConnection();
    connection.query('TRUNCATE TABLE node_mariadb_hs_test', function(err, data){

        var verb = 'INSERT INTO node_mariadb_hs_test SET ';
        var sets = [];

        for(var i in fixture){
            var set = '';
            for(var c in fixture[i]){
                set += c + '="' + fixture[i][c] + '", ';
            }
            sets.push(set.replace(/\,\s{0,}$/, ''));
        }

        var fns = [];
        sets.forEach(function(set){
            fns.push(function(cb){
                connection.query(verb + set, function(err, rows, fields) {
                    if (err) throw err;
                    cb();
                });
            });
        });

        async.series(fns, function(err, data){
            done();
        });
    });
}

exports.tearDown = function(done){
    var connection = getConnection();
    connection.query('TRUNCATE TABLE node_mariadb_hs_test', function(err, data){
        done();
    });
}