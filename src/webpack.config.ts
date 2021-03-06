import path = require('path')
import webpack = require('webpack')
import HtmlWebpackPlugin = require('html-webpack-plugin')

export default {
  mode: 'development',
  entry: path.resolve(__dirname, '../public/index.js'),
  externals: {
    electron: 'null',
    ws: 'WebSocket',
    uws: 'WebSocket',
    'node-fetch': 'fetch',
    cluster: 'null',
    'fs-extra': 'null'
  },
  resolve: {
    modules: [path.resolve(__dirname, '../node_modules')]
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: [{
        loader: 'svelte-loader',
        options: {hotReload: true}
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
} as webpack.Configuration
