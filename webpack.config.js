var path = require("path");
var webpack = require("webpack");
module.exports = {
  cache: true,
  entry: {
    "logary": './src/client.coffee',
    "jquery.instrumentation": './src/instrumentation/jquery.coffee',
    "window.onerror": './src/instrumentation/onerror.coffee'
  },
  output: {
    path: path.join(__dirname, "lib"),
    filename: '[name].js',
    libraryTarget: "umd",
    library: "logary-js"
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' }
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.coffee'] 
  }
};