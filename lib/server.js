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
    for (var key in obj) if (obj.hasOwnProperty(key)) 
      methods.push(key);
    return methods;
  }
};
rmi.register("rmi", rmi);

function onMessageExternal(req, sender, sendResponse) {
  var obj = services[req.service],
      method = req.method,
      args = req.args,
      resp = {};
  try {
    resp.result = obj[method].apply(obj, args);
  } catch(err) {
    console.log("Error with service", req.service, " Method:", method, "Raw request:", req);
    resp.error = err;
  }
  console.log("Sending response to", req.service + "." + method, ":", resp);
  sendResponse(resp);
};
if (rt.onMessageExternal) rt.onMessageExternal.addListener(onMessageExternal);
if (rt.onMessage) rt.onMessage.addListener(onMessageExternal);

function onConnect(port) {
  console.log("Connected port:", port.name);
  port.onMessage.addListener(function(req){
    var obj = services[req.service],
        method = req.method,
        args = req.args,
        resp = { id: req.id };
    try {
      resp.result = obj[method].apply(obj, args);
    } catch(err) {
      console.log("Connect error with service", req.service, " Method:", method, "Raw request:", req);
      resp.error = err;
    }
    console.log("Connect sending response to", req.service + "." + method, ":", resp);
    port.postMessage(resp);
  });
}
if (rt.onConnect) { rt.onConnect.addListener(onConnect); }
if (rt.onConnectExternal) { rt.onConnectExternal.addListener(onConnect); }

module.exports = rmi;
