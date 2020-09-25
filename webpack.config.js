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
    // path: path.resolve(__dirname, 'packages', 'logary-browser', 'dist'),
    path: path.resolve(__dirname, 'examples', 'with-plain-html', 'js'),
    filename: 'logary.min.js',
    library: 'logary',
    libraryTarget: 'umd',
  }
  // Maybe we can optimise this so that logary -> @OT/{api,core,tracing} and each plugin e.g. -> @OT/{web}
  // externals: [
  //   /^@opentelemetry\/.+$/,
  // ]
}