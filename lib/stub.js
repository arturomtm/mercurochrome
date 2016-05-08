var EventEmitter = require('eventemitter3');

var Payload = require('./payload');

function Stub(port, stub) {
  stub.methods.forEach(method => 
    this[method] = Stub.methodFactory(port, new Payload(stub.service, method))
  );
  if (stub.isEventEmitter) {
    var addRemoteEventListener = Stub.methodFactory(port, new Payload(stub.service, "on")); 
    this.on = function(event, cb){
      addRemoteEventListener(event)
      .then(() => EventEmitter.prototype.on.apply(this, arguments))
    }; 
  }
};
Stub.prototype = Object.create(EventEmitter.prototype);

Stub.methodFactory = function methodFactory(port, payload) {
  return function() {
    payload.generateId();
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

module.exports = Stub;
