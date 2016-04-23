/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var rmi = __webpack_require__(1);

	console.log(rmi);

	var test = {
	  echo: function(msg) {
	    return msg;
	  }
	}

	rmi.register("test", test);


/***/ },
/* 1 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);