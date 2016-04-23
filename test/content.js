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

	var rmi = __webpack_require__(2)();

	console.log(rmi);

	rmi.getInstance("test")
	.then(test => test.echo("hello"))
	.then(msg => console.log(msg))


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);