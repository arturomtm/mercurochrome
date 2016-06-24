function createScript(name) {
  var script = document.createElement("script");
  script.src = chrome.runtime.getURL(name);
  document.body.appendChild(script);
}

["build/script.js"].forEach(createScript);
