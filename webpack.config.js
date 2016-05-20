var path = require("path"),
    webpack = require("webpack"),
    UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin'),
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
    },
    plugins: [
      new UglifyJsPlugin({
        exclude: [ './node_modules/**/*' ],
        compress: {
          sequences     : false,  // join consecutive statemets with the “comma operator”
          properties    : false,  // optimize property access: a["foo"] → a.foo
          dead_code     : false,  // discard unreachable code
          drop_debugger : false,  // discard “debugger” statements
          unsafe        : false, // some unsafe optimizations (see below)
          conditionals  : false,  // optimize if-s and conditional expressions
          comparisons   : false,  // optimize comparisons
          evaluate      : false,  // evaluate constant expressions
          booleans      : false,  // optimize boolean expressions
          loops         : false,  // optimize loops
          unused        : false,  // drop unused variables/functions
          hoist_funs    : false,  // hoist function declarations
          hoist_vars    : false, // hoist variable declarations
          if_return     : false,  // optimize if-s followed by return/continue
          join_vars     : false,  // join var declarations
          cascade       : false,  // try to cascade `right` into `left` in sequences
          side_effects  : false,  // drop side-effect-free statements
          global_defs   : {},
          keep_fnames: true
        }
      })
    ]
  }
};

module.exports = createConfig('2.0.2');
