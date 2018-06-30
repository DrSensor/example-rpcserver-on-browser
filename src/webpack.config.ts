import path = require('path')
import webpack = require('webpack')
import HtmlWebpackPlugin = require('html-webpack-plugin')

export default {
  mode: 'development',
  entry: path.resolve(__dirname, '../public/index.js'),
  plugins: [
    new HtmlWebpackPlugin()
  ]
} as webpack.Configuration
