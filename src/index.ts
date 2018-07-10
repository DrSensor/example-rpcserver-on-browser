// tslint:disable:no-single-line-block-comment
// tslint:disable:no-unused
import {Command, flags} from '@oclif/command'
import serve = require('webpack-serve')

import WebpackConfigure from './dynamic-config'
import config from './webpack.config'
import ClientRPC, {LED} from './controllers'
import event, {tab} from './controllers/events'

import REPL from './views/repl'

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
    // @ts-ignore BUG: can't write class inheret another class from ambient declaration
    const remote = new ClientRPC(LED)
    const repl = new REPL()

    webpack.changeContext(args.content)
    webpack.addCDNPlugin(flags.cdn)
    // @ts-ignore
    const webpackServer = await serve({
      config: webpack.config,
      open: flags.open,
      dev: {
        publicPath: '/',
        stats: 'errors-only',
      },
      logLevel: 'error',
      add: app => app.use(event.routes()).use(event.allowedMethods())
    })

    tab.on('close', id => {
      if (tab.allClosed) {
        repl.close()
        // webpackServer.close()
      }
    })

    repl.on('close', webpackServer.close)

    webpackServer.on('listening', ({server}) => {
      remote.upgrade(server)
            .on('connected', () => repl.to(remote.Client))
    })

    webpackServer.on('build-finished', () => repl.promptOnceAfter(1))//seconds
  }
}

export = ReverseRpc
