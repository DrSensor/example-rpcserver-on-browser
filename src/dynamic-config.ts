import path = require('path')
import fs = require('fs')
import webpack = require('webpack')

const check = (str: string) => fs.lstatSync(path.resolve(str))

export default class WebpackConfigurator {
  // #region 📋copy config from ctor
  private _config: webpack.Configuration = {}
  get config() {return this._config}

  constructor(config: webpack.Configuration) {this._config = config}
  // #endregion

  changeContext(content: string) {
    const {resolve, dirname, basename} = path

    // #region 🐣initialize default value
    let contentDir = resolve(content)
    const globalConstant = {
      'args.content.IS_FILE': check(content).isFile(),
      'args.content.FILE': '"@/index.html"'
    }
    // #endregion

    // #region 🌿conditional assignment
    if (check(content).isFile()) {
      contentDir = dirname(resolve(content))
      globalConstant['args.content.FILE'] = `"@/${basename(content)}"`
    } else {
      const node_modules = resolve(contentDir, 'node_modules')
      this._config.resolve!.modules!.push(node_modules)
    }
    // #endregion

    // #region 🐥assign final value
    this._config.plugins!.push(new webpack.DefinePlugin(globalConstant))
    this._config.resolve!.alias = {'@': contentDir}
    this._config.context = contentDir
    // #endregion
  }
}
