import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import pkg from './packages/logary-browser/package.json'

export default {
  input: 'packages/logary-browser/main.ts',

  output: {
    name: 'logary',
    file: pkg.browser,
    format: 'iife'
  },

  plugins: [
    typescript({
      typescript: require('typescript'),
      outDir: './dist'
    }),
    resolve({
      browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: ['node_modules'],
      },
    }),
    commonjs({
      include: 'node_modules/'
    }),
  ]
}
