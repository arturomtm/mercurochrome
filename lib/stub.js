var EventEmitter = require('eventemitter3');

var Payload = require('./payload');

function Stub(port, stub) {
  EventEmitter.call(this)
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
      // keep here a reference to payload.id, because it get lost
      // when multiple calling the function()
      var id = payload.id
      var handler = function(res){
        if (res.id !== id) return;
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
