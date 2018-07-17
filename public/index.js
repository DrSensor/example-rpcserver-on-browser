const sendState = name => navigator.sendBeacon(`/$event/${name}`, window.name);
const createApp = App => new App({ target: document.querySelector('body') });

if (args.content.IS_FILE)
  createApp(require(args.content.FILE).default);
else {
  const importAll = r => r.keys().forEach(key => createApp(r(key).default));
  importAll(require.context('@/', true, /\.html$/));
}

const visibilityChange = () => document.hidden ? sendState('tab/hide') : sendState('tab/show');
document.addEventListener('visibilitychange', visibilityChange);

window.addEventListener('load', () => {
  if (!window.name) {
    window.name = 'tab-'+String.fromCodePoint(...crypto.getRandomValues(new Uint16Array(10)));

    sendState('tab/open');
    visibilityChange();
  } else sendState('tab/reload');
});

window.addEventListener('unload', () => {if (window.name) sendState('tab/close')});
