import RPCServer from '#/RPCServer'

const sendState = name => navigator.sendBeacon(`/$event/${name}`, window.name);
const createApp = App => new App({ target: document.querySelector('body') });

if (args.content.IS_FILE)
  createApp(require(args.content.FILE).default);
else {
  const importAll = r => r.keys().forEach(key => createApp(r(key).default));
  importAll(require.context('@/', true, /\.html$/));
}

let rpc;
const visibilityChange = skip => {
  if (document.hidden) {
    if (!skip) sendState('tab/hide');
    if (rpc instanceof RPCServer) rpc.websocket.close();
  } else {
    if (!skip) sendState('tab/show');
    if (RPCServer.registered) rpc = new RPCServer('/rpc');
    else setTimeout(() => visibilityChange(true), 1000);
  }
}

document.addEventListener('visibilitychange', () => visibilityChange());

window.addEventListener('load', () => {
  if (!window.name) {
    window.name = 'tab-'+String.fromCodePoint(...crypto.getRandomValues(new Uint16Array(10)));

    sendState('tab/open');
    visibilityChange();
  } else {
    sendState('tab/reload');
    visibilityChange();
  }
});

window.addEventListener('unload', () => {if (window.name) sendState('tab/close')});
