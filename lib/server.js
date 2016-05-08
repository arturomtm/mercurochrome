var rt = chrome.runtime,
    services = {};

var rmi = {
  register: function(name, object) {
    if (!name || services[name]) return;
    services[name] = object;
  },
  unregister: function(name) {},
  getStub: function(name) {
    var obj = services[name],
        methods = [];
    for (var key in obj) if (obj.hasOwnProperty(key) && typeof obj[key] === "function")
      methods.push(key);
    return {
      service: name,
      isEventEmitter: !!(obj.on),
      methods: methods
    };
  }
};
rmi.register("rmi", rmi);

function onConnect(port) {
  port.onMessage.addListener(function(req){
    var service = services[req.service],
        method = req.method,
        args = req.args,
        resp = { id: req.id };
    if (method === "on" && service.on) args.push(function(){
      var event = req.args[0],
          args = Array.prototype.slice.call(arguments);
      port.postMessage({
        service: req.service,
        method: "emit",
        args: [event].concat(args)
      });
    });
    try {
      resp.result = service[method].apply(service, args);
      port.postMessage(resp);
    } catch(err) {
      delete resp.result;
      if (!(err instanceof TypeError)) resp.error = err.message;
      port.postMessage(resp);
    }
  });
}
if (rt.onConnect) rt.onConnect.addListener(onConnect);
if (rt.onConnectExternal) rt.onConnectExternal.addListener(onConnect);

module.exports = rmi;
