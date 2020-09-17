import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'
import rollupGitVersion from 'rollup-plugin-git-version'
import pkg from './packages/browser/package.json'

export default {

  input: 'packages/browser/main.ts',
  output: {
    name: 'logary',
    file: pkg.browser,
    format: 'umd'
  },

  entry: 'packages/browser/main.js',
  dest: 'dist/index.js',
  plugins: [
    resolve(),   // so Rollup can find `ms`
    commonjs(),  // so Rollup can convert `ms` to an ES module
    typescript(), // so Rollup can convert TypeScript to JavaScript
    rollupGitVersion()
  ]
}
