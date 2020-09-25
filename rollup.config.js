import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import pkg from './packages/logary-browser/package.json'

export default {
  input: 'packages/logary-browser/main.ts',

  output: {
    name: 'logary',
    file: pkg.browser,
    format: 'iife'
  },

  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: ['node_modules'],
      },
    }),
    typescript({
      typescript: require('typescript'),
      tsconfig: "tsconfig.json",
      outDir: './dist',
      include: '**/*.{js,ts}',
    }),
    // commonjs({
    //   extensions: [ '.js', '.ts' ],
    //   include: 'node_modules/'
    // }),
    json(),
  ]
}
