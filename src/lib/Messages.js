"use strict";
{
  let handlers = new Set();
  
  let forever = new Promise(resolve => {});
  let dispatch = async (msg, sender) => {
    let {_messageName} = msg;
    for (let h of handlers) {
      let f = h[_messageName];
      if (typeof f === "function") {
        return await f(msg, sender);
      }
    }
    await forever;
  };
  
  var Messages = {
    addHandler(handler) {
      let originalSize = handlers.size;
      handlers.add(handler);
      if (originalSize === 0 && handlers.size === 1) {
        browser.runtime.onMessage.addListener(dispatch);
      }
    },
    removeHandler(handler) {
      let originalSize = handlers.size;
      handlers.delete(handler);
      if (originalSize === 1 && handlers.size === 0) {
        browser.runtime.onMessage.removeListener(dispatch);
      }
    },
    async send(name, args = {}, toContent = null) {
      args._messageName = name;
      if (toContent && "tabId" in toContent) {
        let opts;
        if ("frameId" in toContent) opts = {frameId: toContent.frameId};
        return await browser.tabs.sendMessage(toContent.tabId, args, opts);
      }
      return await browser.runtime.sendMessage(args);
    }
  }
}
