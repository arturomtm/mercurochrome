var id = require('./extension_id'),
    rmi = require("../../lib/client")(id);

console.log("[TestExtension:Script]", rmi);

rmi.getInstance("test")
.then(test => {
  console.log("[TestExtension:Script]", test);
  test.on("testevent", i => console.log("[TestExtension:Script]", i));
  return test.echo("hello")
})
.then(msg => console.log("[TestExtension:Script]", msg))

