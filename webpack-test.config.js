var path = require("path"),
    webpack = require("webpack"),
    loaders = require('./webpack-loaders.js'),
    version = '0.8.0',
    libraryName = 'logary';

module.exports = {
  devtool: 'source-map',
  target: 'node',
  output: {
    // sourcemap support for IntelliJ/Webstorm
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  module: {
    loaders: loaders
  },
  resolve: {
    extensions: ['', '.js']
  }
};


