#!./node_modules/babel-cli/bin/babel-node.js
var path = require('path');
var express = require('express');
var app = express();
var webpack = require('webpack');
var compiler = webpack(require('./webpack.config.js'));

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: false,
  publicPath: '/',
  color: true
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use('/', function (req, res, next) {
  console.log(req.url);
  var filename = path.join(compiler.outputPath, 'index.html');
  compiler.outputFileSystem.readFile(filename, function(err, result){
    if (err) {
      return next(err);
    }
    res.set('content-type','text/html; charset=utf-8');
    res.send(result);
    res.end();
  });
});

app.listen(3001, 'localhost', function (err) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('Listening at http://localhost:3001');
});

