//var EventEmitter = require('eventemitter3');

var send = chrome.runtime.sendMessage,
    cache = {};

/*function Stub() {};
Object.assign(Stub.prototype, EventEmitter.prototype);*/

function methodFactory(id, service, method) {
  return function(){
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject){
      var payload = { service: service, method: method, args: args },
          sendCb = function(resp){
            console.log("Response to", service + "." + method, "->", resp);
            if (!resp || resp.error) reject();
            resolve(resp.result);
          };
      if (id) send(id, payload, sendCb);
      else send(payload, sendCb);
    });
  };
}

function Client(id){
  return {
    getStub: methodFactory(id, "rmi", "getStub"),
    getInstance: function(service){
      return (service in cache)? 
        Promise.resolve(cache[service]) :
        this.getStub(service)
        .then(function(stub){
          var obj = {};
          stub.forEach(function(method){
            obj[method] = methodFactory(id, service, method);
          });
          cache[service] = obj;
          return Promise.resolve(obj);
        })
    }
  };
}

module.exports = Client;
