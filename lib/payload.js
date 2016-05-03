function Payload(service, method){
  this.service = service;
  this.method = method;
  this.id = this.generateId();
}
Payload.prototype.generateId = function(){
  return (Date.now() * Math.random() * 1000000).toString(16);
}

module.exports = Payload;
