function Payload(service, method){
  this.service = service;
  this.method = method;
}
Payload.prototype.generateId = function(){
  this.id = (Date.now() * Math.random() * 1000000).toString(16);
}

module.exports = Payload;
