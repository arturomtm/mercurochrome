var rmi = require("../../lib/client")();

console.log(rmi);

rmi.getInstance("test")
.then(test => test.echo("hello"))
.then(msg => console.log(msg))
