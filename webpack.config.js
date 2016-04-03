var path = require("path"),
    webpack = require("webpack"),
    loaders = require('./webpack-loaders.js');

var createConfig = function(version) {
  return {
    cache: true,
    devtool: 'source-map',
    entry: {
      'logary': path.join(__dirname, 'src', 'index.js')
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: 'logary.js',
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

module.exports = createConfig('1.0.0');
