module.exports = (grunt) ->
  pkgData  = grunt.file.readJSON('package.json')
  wp       = require('webpack')
  wpConfig = require('./webpack.config.js')(pkgData.version)

  grunt.initConfig
    pkg: pkgData

    webpack:
      options: wpConfig
      build:
        plugins:
          wpConfig.plugins.concat(
            new wp.DefinePlugin(
              "process.env":
                "NODE_ENV": JSON.stringify("production")
            ),
            new wp.optimize.DedupePlugin(),
            new wp.optimize.UglifyJsPlugin()
          )
      "build-dev":
        devtool: "sourcemap"
        debug: true

    watch:
      test_only:
        files: ['test/unit/**/*.coffee']
        tasks: ['test']
        options:
          interrupt: true

      build_and_test:
        files: ['test/unit/**/*.coffee']
        tasks: ['build', 'test']
        options:
          interrupt: true

    connect:
      server:
        options:
          port: 9001
          keepalive: true

      integration_test:
        options:
          hostname: '*'
          port: 9001
          base: '.'
          keepalive: true

    mochacli:
      all: ['test/unit/**/*.coffee']
      options:
        compilers: ['coffee:coffee-script/register']
        files: 'test/unit/*.coffee'
        bail: true
        reporter: 'spec'

    bump:
      options:
        updateConfigs: ['pkg']

    karma:
      unit:
        configFile: 'karma.conf.coffee'


  require('load-grunt-tasks') grunt
  grunt.registerTask('test', ['mochacli'])

  # Running the `serve` command starts up a webserver.
  grunt.registerTask('serve', ['connect'])
  grunt.registerTask('build', 'webpack:build')
  grunt.registerTask('default', 'webpack:build')

  # Push distribution libraries to CDN.
  # Build and publish distribution site.
  grunt.registerTask('publish', [])
