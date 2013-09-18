node-mariadb
=========================

node-mariadb is a pure javascript client of mariadb.



## Usage
<pre>

var nodeMaria = require('node-mariadb');

var client = nodeMaria.createConnection({
  driverType: 'HandlerSocket'
  ,host: 'localhost',
  ,port: 3306 
});

var indexid = 1;
var dbname = 'dbname';
var tablename = 'tablename';
var indexname = nodeMaria.HandlerSocket.PRIMARY;

client.on('connect', function(connection){
    connection.openIndex(indexid, dbname, tablename, indexname, ['id', 'name', 'age']
      , function(err, hs){
        
        hs.native.find(), hs.native.insert() etc...
           or 
        hs.first(), hs.all(), hs.save() etc...
      
    });
});


client.on('erorr', function(){

});



client.on('close', function(){

});


client.on('timeout', function(){

});


</pre>
