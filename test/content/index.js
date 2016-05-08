var rmi = require("../../lib/client")();

console.log(rmi);

rmi.getInstance("test")
.then(test => {
  test.on("testevent", i => console.log("[TestExtension:Content]", i));
  return test.echo("hello")
})
.then(msg => console.log(msg))
