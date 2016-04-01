module.exports = [
  {
    test: /\.js$/,
    loader: 'babel',
    exclude: /node_modules/
  },
  {
    test: /\.js$/,
    loader: "eslint-loader",
    exclude: /node_modules/
  }
];
