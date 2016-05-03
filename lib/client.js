//var EventEmitter = require('eventemitter3');

var rt = chrome.runtime,
    send = rt.sendMessage,
    cache = {};

/*function Stub() {};
Object.assign(Stub.prototype, EventEmitter.prototype);*/

function generateId(){
  return (Date.now() * Math.random() * 1000000).toString(16);
}

function methodFactory(port, payload) {
  return function() {
    payload.id = generateId();
    payload.args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject){
      var handler = function(res){
        if (res.id !== payload.id) return;
        port.onMessage.removeListener(handler);
        if (res.error) reject();
        else resolve(res.result);
      };
      port.onMessage.addListener(handler);
      port.postMessage(payload);
    });
  }
}

function Client(id){
  id = id || rt.id;
  var port = rt.connect(id);
  return {
    getStub: methodFactory(port, {service: "rmi", method: "getStub"}),
    getInstance: function(service){
      if (service in cache) 
        return Promise.resolve(cache[service]);
      return this.getStub(service)
      .then(function(stub){
        return cache[service] = stub.reduce(function(obj, method){
          var payload = {service: service, method: method};
          obj[method] = methodFactory(port, payload)
          return obj;
        }, {});
      })
    }
  };
}

module.exports = Client;
