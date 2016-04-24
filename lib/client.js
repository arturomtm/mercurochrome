//var EventEmitter = require('eventemitter3');

var rt = chrome.runtime,
    send = rt.sendMessage,
    cache = {};

/*function Stub() {};
Object.assign(Stub.prototype, EventEmitter.prototype);*/

function generateId(){
  return (Date.now() * Math.random() * 1000000).toString(16);
}

function methodFactory(port, id, service, method) {
  return function(){
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject){
      var payload = { service: service, method: method, args: args, id: generateId() },
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
  var pending = {};
  return {
    getStub: methodFactory(undefined, id, "rmi", "getStub"),
    getInstance: function(service){
      if (service in cache) return Promise.resolve(cache[service]);
      var port = rt.connect(id || { name: service });
      port.onMessage.addListener(function(res){
        if (!res) throw new Error("Critical: no response onMessage");
        var promise = pending[res.id];
        delete pending[res.id];
        if (res.error) promise.reject();
        else promise.resolve(res.result);
      });
      return this.getStub(service)
      .then(function(stub){
        return cache[service] = stub.reduce(function(obj, method){
          obj[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            return new Promise(function(resolve, reject){
              var guid = generateId();
              pending[guid] = { resolve: resolve, reject: reject };
              port.postMessage({ service: service, method: method, args: args, id: guid });
            });
          }
          return obj;
        }, {});
      })
    }
  };
}

module.exports = Client;
