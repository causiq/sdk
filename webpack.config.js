var path = require("path"),
    webpack = require("webpack"),
    StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = function(version) {
  return {
    cache: true,
    entry: {
      "client": './src/client.coffee',
      "logary.onerror": './src/instrumentation/onerror.coffee'
    },
    output: {
      path: path.join(__dirname, "lib"),
      filename: '[name].js',
      libraryTarget: "umd",
      library: "logary"
    },
    module: {
      loaders: [
        { test: /\.coffee$/, loader: StringReplacePlugin.replace(['coffee-loader'], {
                                        replacements: [{
                                          pattern: /@@VERSION@@/g,
                                          replacement: function() { return version; }
                                        }]
                                      })

        }
      ]
    },
    resolve: {
      // you can now require('file') instead of require('file.coffee')
      extensions: ['', '.js', '.coffee'] 
    },
    devtool: 'source-map',
    plugins: [
      new StringReplacePlugin()
    ]
  }
}
