const sendState = name => navigator.sendBeacon(`/$event/${name}`, window.name)
const createApp = App => new App({ target: document.body })

if (args.content.IS_FILE)
  createApp(require(args.content.FILE).default);
else {
  const importAll = r => r.keys().forEach(key => createApp(r(key).default));
  importAll(require.context('@/', true, /\.html$/));
}

// FUTURE: use https://www.npmjs.com/package/shortid for more friendly random ID
window.addEventListener('load', () => {
  if (!window.name) {
    window.name = 'tab-'+String.fromCodePoint(...crypto.getRandomValues(new Uint16Array(10)));
    sendState('open');

    if (document.hidden) sendState('hide');
    else sendState('show');

  } else sendState('reload');
});

document.addEventListener('visibilitychange', () => document.hidden ? sendState('hide') : sendState('show'));

window.addEventListener('unload', () => sendState('close'));
