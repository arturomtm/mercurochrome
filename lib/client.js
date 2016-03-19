var send = chrome.runtime.sendMessage,
    id = require("./extension_id"),
    cache = {};

function methodFactory(id, service, method) {
  return function(){
    var args = Array.prototype.slice.call(arguments),
        cb = args.pop();
    if (typeof cb !== "function") {
      args.push(cb);
      cb = undefined;
    }
    send(id, {service: service, method: method, args: args}, function(resp){
      if (resp.error) throw new Error(resp.error);
      cb && cb(resp.result);
    });
  };
}

var rmi = {
  getStub: methodFactory(id, "rmi", "getStub"),
  getInstance: function(service, cb){
    var obj = cache[service] || {};
    if (service in cache) return cb && cb(obj);
    this.getStub(service, function(stub){
      stub.forEach(function(method){
        obj[method] = methodFactory(id, service, method);
      });
      cache[service] = obj;
      cb && cb(obj);
    }); 
  }
};

module.exports = rmi;
