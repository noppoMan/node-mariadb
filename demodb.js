var print = require("print")
var nodeMaria = require("node-mariadb")
print.out(nodeMaria.DRIVER_TYPE_HANDLER_SOCKET);

var connection = nodeMaria.createConnection({
  driverType: nodeMaria.DRIVER_TYPE_HANDLER_SOCKET,
  host:'localhost',
  port:3306
});
 
connection.on('erorr', function(err){
  console.log(err);
  process.exit(1);
});
 
connection.on('connect', function(){
 connection.openIndex('demo', connection)});
 
connection.on('erorr', function(err){
  console.log(err);
  process.exit(1);
});
 
connection.on('connect', function(){

  connection.openIndex('demo', 'question', nodeMaria.HandlerSocket.PRIMARY, ['Question_ID', 'Question']
  , function(err, hs){
    hs.find([1], {limit:1},function(err, data){
      console.log(data);
    });
  });
});
