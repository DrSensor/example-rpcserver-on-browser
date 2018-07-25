// tslint:disable:no-console
import {Command, flags} from '@oclif/command'
import serve = require('webpack-serve')

import WebpackConfigure from './dynamic-config'
import config from './webpack.config'
import event, {tab} from './controller/event'

// #region helper function to count state and print it when exit
let count = {} as {[key: string]: number}

const print = (msg: string) => {
  console.log(`\n${msg} at ${new Date().toLocaleTimeString()}\n`)
  const state = msg.split(' ')[0]
  count[state] = ++count[state] || 1
}

const close = (server: serve.Instance) => {
  count.CLOSE += 1
  console.log(JSON.stringify(count, null, 2))
  server.close()
}
// #endregion

class ReverseRpc extends Command {
  static description = 'Reverse RPC that can control webapp behaviour'

  static flags = {
    cdn: flags.string({char: 'c', description: 'inject script tag of URL of the external script (CDN)', multiple: true}),
    open: flags.boolean({description: 'open browser on start'})
  }

  static args = [
    {
      name: 'content',
      description: '.html file or directory that contain .html component that want to be served.' +
      '\nDefault is `index.html` if it\'s directory',
      required: true,
    }
  ]

  async run() {
    const {args, flags} = this.parse(ReverseRpc)
    const webpack = new WebpackConfigure(config)

    webpack.changeContext(args.content)
    webpack.addCDNPlugin(flags.cdn)

    const webpackServer = await serve({
      config: webpack.config,
      open: flags.open,
      dev: {
        publicPath: '/',
        stats: 'errors-only', // don't print when new compilation happen
      },
      add: app => app.use(event.routes()).use(event.allowedMethods())
    })

    tab.on('close', id => tab.allClosed ? close(webpackServer) : print(`CLOSE ${id}`))

    tab.on('open', id => print(`OPEN ${id}`))
    tab.on('reload', id => print(`RELOAD ${id}`))
    tab.on('hide', id => print(`HIDE ${id}`))
    tab.on('show', id => print(`SHOW ${id}`))
  }
}

export = ReverseRpc
