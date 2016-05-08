var EventEmitter = require('eventemitter3');

var rmi = require("../../lib/server");

console.log("[TestExtension:Background]", rmi);

function Test(){
  this.i = 0;
};
Test.prototype = Object.create(EventEmitter.prototype);

var test = new Test();
Object.assign(test, {
  echo: function(msg) {
    return msg;
  }
});

setInterval(function(){
  test.emit("testevent", ++test.i);
}, 1000);

rmi.register("test", test);
