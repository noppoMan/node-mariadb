node-mariadb
=========================

Node-mariadb is a pure javascript client for mariadb.  
Our goal is supporting almost functions of mariadb.

<b>Node-mariadb currentyly supported only HandlerSocket Driver(ver 0.1.1).</b>

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




## HandlerSocket


### Find
#### hs.find(Mix values, [Object options], Function callback&lt;Object error, Array data&gt;)
Find rows by values and options.

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
#### hs.insert(Mix values, [Object options], Function callback&lt;Object error, Bool isSuccess&gt;)
Insert row.

#### Arguments
* `values` : [value1, value2, ... ]
* `callback`: callback function.

----

### Update
#### hs.update(Mix values, [Object options], Function callback&lt;Object error, Array data&gt;)
Update rows by values and options.  
Update arguments are similar to find. A only different option is set which is used to set update values like as update clause of sql.

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
#### hs.delete(Mix values, [Object options], Function callback&lt;Object error, Array data&gt;)
Delete row by values and options. It arguments are same as find.

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
#### hs.increment(Mix values, [Object options], Function callback&lt;Object error, Array data&gt;)
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
#### hs.delete(Mix values, [Object options], Function callback&lt;Object error, Array data&gt;)
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





## Run Test
<pre>
$ npm test
</pre>


## License

(The MIT License)

Copyright (c) 2013 Yuki Takei(Noppoman) <yuki@miketokyo.com>
