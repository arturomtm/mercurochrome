var Stub = require('./stub'),
    Payload = require('./payload');

var rt = chrome.runtime;

function Client(id){
  id = id || rt.id;
  var port = rt.connect(id),
      cache = {};
  port.onMessage.addListener(function(req){
    if (req.id) return;
    var service = cache[req.service],
        method = service[req.method];
    method && method.apply(service, req.args);
  });
  return {
    getStub: Stub.methodFactory(port, new Payload("rmi", "getStub")),
    getInstance: function(service){
      return (service in cache)
      ? Promise.resolve(cache[service])
      : this.getStub(service)
        .then(function(stub){
          return cache[service] = new Stub(port, stub)
        });
    }
  };
}

module.exports = Client;
