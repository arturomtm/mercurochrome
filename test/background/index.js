var rmi = require("../../lib/server");

console.log(rmi);

var test = {
  echo: function(msg) {
    return msg;
  }
}

rmi.register("test", test);
