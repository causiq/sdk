var path = require("path"),
    webpack = require("webpack"),
    loaders = require('./webpack-loaders');

var createConfig = function(version) {
  return {
    cache: true,
    devtool: 'inline-source-map',
    output: {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
      libraryTarget: "umd",
      library: "logary"
    },
    module: {
      loaders: loaders
    },
    resolve: {
      extensions: ['', '.js']
    }
  }
};

module.exports = createConfig('2.0.1');
