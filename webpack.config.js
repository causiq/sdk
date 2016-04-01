var path = require("path"),
    webpack = require("webpack"),
    loaders = require('./webpack-loaders'),
    StringReplacePlugin = require("string-replace-webpack-plugin"),
    UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var createConfig = function(version, env) {
  var env = env || 'build',
      libraryName = 'logary',
      plugins = [ new StringReplacePlugin() ];

  if (env === 'build') {
    plugins.push(new UglifyJsPlugin({ minimize: true }));
  }

  return {
    entry: {
      'index': path.join(__dirname, 'src', 'index.js')
    },
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, "dist"),
      filename: (env === 'build' ? libraryName + '.min.js' : libraryName + '.js'),
      libraryTarget: 'umd',
      library: libraryName,
      umdNamedDefine: true
    },
    module: {
      loaders: loaders
    },
    resolve: {
      extensions: ['', '.js']
    },
    plugins: plugins
  }
};

var version = '0.8.0';

module.exports = createConfig(version, 'build');
