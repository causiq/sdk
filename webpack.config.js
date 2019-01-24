var path = require("path")

module.exports = {
  devtool: 'source-map',
  entry: {
    'logary': path.join(__dirname, 'src', 'index.js')
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: 'logary.js',
    libraryTarget: 'umd',
    library: "logary"
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}