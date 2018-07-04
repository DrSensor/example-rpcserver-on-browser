import {Command, flags} from '@oclif/command'
import serve = require('webpack-serve')

import WebpackConfigure from './dynamic-config'
import config from './webpack.config'

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
    serve({
      config: webpack.config,
      open: flags.open
    })
  }
}

export = ReverseRpc
