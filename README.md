node-mariadb
=========================

node-mariadb is a pure javascript client for mariadb.

## Important!
Node-mariadb is developing now.  
So, We may have some bugs and problems.   
You should not install this yet.  


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

connection.on('connect', function(){
  console.log('connect');
});

connection.on('erorr', function(err){
  console.log(err);
});

var dbname = 'dbname';
var tablename = 'tablename';
var indexname = nodeMaria.HandlerSocket.PRIMARY;

connection.openIndex(dbname, tablename, indexname, ['id', 'name', 'age']
  , function(err, hs){
    
    hs.find([1], {
      limit:1
    },function(err, data){
      console.log(data);   =>  {id: '1', name: 'jack', age: '63'}
    });
  
  });
  
});
</pre>
