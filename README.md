node-mariadb
=========================

Node-mariadb is a pure javascript client for mariadb.  
Our goal is supporting almost functions and protocols of mariadb.

<b>The latest version of node-mariadb supported only HandlerSocket Driver(ver 0.1.1).</b>

## Supported protocol and function.
* HandlerSocket

### Future  (Not implemented yet)
* Regular mysql protocol
* Galera cluster
* Non-blocking api client


## Installation
<pre>
$ npm install node-mariadb
</pre>

## Basic Sample of HandlerSocket Driver (Read).

```javascript
var nodeMaria = require('node-mariadb');

//hs readable configuration.
var connection = nodeMaria.createConnection({
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9998
});

connection.on('erorr', function(err){
  console.log(err);
  process.exit(1);
});

connection.on('connect', function(){
  
  ### Basic find.
  connection.openIndex('CTU', 'employee', nodeMaria.HandlerSocket.PRIMARY, ['id', 'name', 'age']
  , function(err, hs){
    hs.find([1], {limit:1},function(err, data){
      console.log(data);   =>  [{id: '1', name: 'jack', age: '40'}]
    });
  });


  ### Find with in clause
  connection.openIndex('CTU', 'employee', nodeMaria.HandlerSocket.PRIMARY, ['id', 'name', 'age'], ['id']
  , function(err, hs){
    hs.find({in: [1, 2, 3]}, {limit: 3}, function(err, data){
      console.log(data);   =>  [{id: '2', name: 'Tonny', age: '38'}, .... ]
    });
  });


  ### Find with filter
  connection.openIndex('CTU', 'employee', 'age', ['id', 'name', 'age'], ['age']
  , function(err, hs){
    hs.find([26], {operator: '>', limit:5, filter:['age', '<=', 28]}, function(err, data){
      console.log(data);   =>  [{id: '2', name: 'Chloe', age: '35'}, ..... ]
    });
  });
  
});
```

## Basic Sample of HandlerSocket Driver (Write).

```javascript
var nodeMaria = require('node-mariadb');

//hs writeable configuration.
var connection = nodeMaria.createConnection({
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:9999
});

connection.on('erorr', function(err){
  console.log(err);
  process.exit(1);
});

connection.on('connect', function(){
  
  ### Insert
  connection.openIndex('CTU', 'employee', nodeMaria.HandlerSocket.PRIMARY, ['id', 'name', 'age']
  , function(err, hs){
    hs.insert([10, 'Edgar', 35],function(err, data){
      console.log(data);   => true
    });
  });


  ### Update
  connection.openIndex('CTU', 'employee', nodeMaria.HandlerSocket.PRIMARY, ['id', 'name', 'age'], ['id']
  , function(err, hs){
    hs.update([12], {set:[12, 'Bill', 50]}, function(err, affectedNum){
      console.log(affectedNum);   =>  1
    });
  });

});
```


# Api Reference 

### createConnection

#### nodeMaria.createConnection(Object settings, [Object options)

#### Arguments
* `settings`: 
 - driverType: A driver type name. Currently suppoerted only HandlerSocket.
 - host: A host name or address for mariadb server.
 - port: A port number for mariadb server.
 - auth: {key: 'Your authnetication key'}
* `options`: Options(debug, logging, etc...). (Not implemented yet.)

----

### Constants
##### nodeMaria.DRIVER_TYPE_MYSQL_REGULAR_PROTOCOL
##### nodeMaria.DRIVER_TYPE_HANDLER_SOCKET

----

### Events
#### connect 
Emitted when a connection is established.

#### error 
Emitted when an error is occured.

####close
Emitted when a connection is closed.

----

## HandlerSocket

### openIndex
#### con.openIndex(Array config, Function callback&lt;Object error, Object Index&gt;)
open index to prepare to handle records.

#### Arguments
* `config`
 1. A database name
 2. A table name
 3. An index name. If you would like to use 'Primary', you can use constant of Handlersocket.PRIMARY.
 4. An array of column names.
 5. optional [An array of column names use for filter or while filter.]
* `callback`: Callback function

### Find
#### hs.find(Any values, [Object options], Function callback&lt;Object error, Array data&gt;)
Find records by values and options.

#### Arguments
* `values` : [value1, value2, ... ] or {in: [value1, value2, ... ]}
* `options`: 
 - limit: num , offset: num
 - operator: `=`,`>`,`>=`,`<`and`<=`
 - filter: ['indexname', 'operator', 'value']
 - while: ['indexname', 'operator', 'value']
* `callback`: callback function.

----

### Insert
#### hs.insert(Any values, [Object options], Function callback&lt;Object error, Bool isSuccess&gt;)
Insert record.

#### Arguments
* `values` : [value1, value2, ... ]
* `callback`: callback function.

----

### Update
#### hs.update(Any values, [Object options], Function callback&lt;Object error, Number affectedNum&gt;)
Update rows by values and options.  
It arguments are similar to find. A only different is 'set' option which is used to set update values like as update clause of sql.

#### Arguments
* `values` : [value1, value2, ... ] or {in: [value1, value2, ... ]}
* `options`: 
 - set: [value1, value2, .... ]
 - limit: num , offset: num
 - operator: `=`,`>`,`>=`,`<`and`<=`
 - filter: ['indexname', 'operator', 'value']
 - while: ['indexname', 'operator', 'value']
* `callback`: callback function.

----


### Delete
#### hs.delete(Any values, [Object options], Function callback&lt;Object error, Number affectedNum&gt;)
Delete records by values and options. It arguments are same as find.

#### Arguments
* `values` : [value1, value2, ... ] or {in: [value1, value2, ... ]}
* `options`: 
 - limit: num , offset: num
 - operator: `=`,`>`,`>=`,`<`and`<=`
 - filter: ['indexname', 'operator', 'value']
 - while: ['indexname', 'operator', 'value']
* `callback`: callback function.

----

### Increment
#### hs.increment(Any values, [Object options], Function callback&lt;Object error, Number affectedNum&gt;)
Increment data to '+' options num.

#### Arguments
* `values` : [value1, value2, ... ] or {in: [value1, value2, ... ]}
* `options`: 
 - '+': num
 - limit: num , offset: num
 - operator: `=`,`>`,`>=`,`<`and`<=`
 - filter: ['indexname', 'operator', 'value']
 - while: ['indexname', 'operator', 'value']
* `callback`: callback function.

----

### Decrement
#### hs.delete(Mix values, [Object options], Function callback&lt;Object error, Number affectedNum&gt;)
Decrement data to '-' options num.

#### Arguments
* `values` : [value1, value2, ... ] or {in: [value1, value2, ... ]}
* `options`: 
 - '-': num
 - limit: num , offset: num
 - operator: `=`,`>`,`>=`,`<`and`<=`
 - filter: ['indexname', 'operator', 'value']
 - while: ['indexname', 'operator', 'value']
* `callback`: callback function.

----

### [Modifier]Get

[Modifier]Get behavior is same as normal modifier(Such as update, delete, increment and decrement).  
But, their return values are not affected num but records which are contents of the records before modification.

##### hs.updateGet(Any values, [Object options], Function callback&lt;Object error, Array beforeModRecords&gt;)
##### hs.deleteGet(Any values, [Object options], Function callback&lt;Object error, Array beforeModRecords&gt;)
##### hs.incrementGet(Any values, [Object options], Function callback&lt;Object error, Array beforeModRecords&gt;)
##### hs.decrementGet(Any values, [Object options], Function callback&lt;Object error, Array beforeModRecords&gt;)




## Run Test
<pre>
$ npm test
</pre>


## License

(The MIT License)

Copyright (c) 2013 Yuki Takei(Noppoman) <yuki@miketokyo.com>
