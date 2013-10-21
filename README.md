node-mariadb
=========================

node-mariadb is a pure javascript client for mariadb.

## Important!  
Node-mariadb has been developing.  
So, We may have some bugs and problems which are not expected.  
You should not install and use this yet.  
But if someone who saw this project is interested in us please contact yuki@miketokyo.com.  
We welcome!

## Basic Sample of HandlerSocket Driver.

```javascript
var nodeMaria = require('node-mariadb');

var connection = nodeMaria.createConnection({
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9998,
  options:
  {
    debug:true,
  }
});

connection.on('erorr', function(err){
  console.log(err);
  process.exit(1);
});

var dbname = 'dbname';
var tablename = 'tablename';
var indexname = nodeMaria.HandlerSocket.PRIMARY;

connection.on('connect', function(){
  connection.openIndex(dbname, tablename, indexname, ['id', 'name', 'age']
    , function(err, hs){
      hs.find([1], {limit:1},function(err, data){
        console.log(data);   =>  [{id: '1', name: 'Jack', age: '30'}]
        connection.close();
      });
    });
  });
});
```

## Api Reference

### find
#### hs.find(Array fields, [Object options], Function callback&lt;error, Array data&gt;)

```javascript
connection.on('connect', function(){
  connection.openIndex('dbname', 'tablename', 'indexname', ['id', 'name', 'age']
  , function(err, hs){
    hs.find([1], {limit:1},function(err, data){
      console.log(data);   =>  [{id: '1', name: 'jack', age: '30'}]
    });
  });
});
```

----

### findIn
#### hs.findIn(Array fields, [Object options], Function callback&lt;error, Array data&gt;)

```javascript
connection.on('connect', function(){
  connection.openIndex('dbname', 'tablename', 'indexname', ['id', 'name', 'age']
  , function(err, hs){
    hs.findIn([1,2], {limit:2},function(err, data){
      console.log(data);   =>  [{id: '1', name: 'Jack', age: '30'}, {id: '2', name: 'Tonny', age: '28'}]
    });
  });
});
```
