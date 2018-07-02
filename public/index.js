const createApp = App => new App({ target: document.querySelector('body') });

if (args.content.IS_FILE)
  createApp(require(args.content.FILE).default);
else {
  const importAll = r => r.keys().forEach(key => createApp(r(key).default));
  importAll(require.context('@/', true, /\.html$/));
}
