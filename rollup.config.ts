// See: https://rollupjs.org/introduction/

import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  external: ['child_process', 'fs', 'path', '@actions/core'],
  plugins: [
    typescript(),
    nodeResolve({ extensions: ['.js', '.ts'], preferBuiltins: true }),
    commonjs({ include: /node_modules/ })
  ]
}

export default config
