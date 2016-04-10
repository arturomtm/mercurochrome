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

module.exports = rmi;
