var webpack = require('webpack');
module.exports = {
  entry: "./app.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    preLoaders: [
      {
        test: /(logary\..+|client)\.js$/,
        loader: "source-map-loader"
      }
    ],
    loaders: [
      { test: /\.css$/, loader: "style-loader!css" },
      { test: /\.js$/, loader: "jsx-loader?harmony" }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  externals: {
    jquery: "jQuery"
  }
};