import path = require('path')
import webpack = require('webpack')
import HtmlWebpackPlugin = require('html-webpack-plugin')

export default {
  mode: 'development',
  entry: path.resolve(__dirname, '../public/index.js'),
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
