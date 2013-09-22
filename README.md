node-mariadb
=========================

node-mariadb is a pure javascript client of mariadb.



## Usage
<pre>

var nodeMaria = require('node-mariadb');


var connection = nodeMaria.createConnection({
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9998,
  options:
  {
    debug:true,
    connectionAutoClose:false
  }
});

var indexid = 1;
var dbname = 'dbname';
var tablename = 'tablename';
var indexname = nodeMaria.HandlerSocket.PRIMARY;

connection.on('connect', function(){
  console.log('connect');
});


connection.on('erorr', function(err){
  console.log(err);
});

connection.openIndex(indexid, dbname, tablename, indexname, ['id', 'name', 'age']
  , function(err, hs){
    
    hs.native.find(), hs.native.insert() etc...
       or 
    hs.first(), hs.all(), hs.save() etc...
  
});
</pre>
