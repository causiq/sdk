webpack = require('./webpack-test.config.js')

module.exports = (config) ->
  config.set
    basePath: ''
    frameworks: ['fixture', 'mocha', 'chai', 'sinon']
    plugins: ['karma-*']
    files: [
      {pattern: 'test/e2e/main_test.coffee'},
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'test/e2e/*.coffee', included: false},
      {pattern: 'test/e2e/fixtures/*'},
    ]
    browsers: ['Firefox']
    autoWatch: true
    webpack: webpack
    webpackMiddleware:
      noInfo: true
    preprocessors: {
      '**/*.coffee': ['webpack'],
      '**/*.html': ['html2js']
    }
