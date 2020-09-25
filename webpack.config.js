const path = require('path');

module.exports = {
  entry: './packages/logary-browser/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'logary.min.js',
    library: 'logary',
    libraryTarget: 'umd',
  },
  externals: [
    /^@opentelemetry\/.+$/,
  ]
}