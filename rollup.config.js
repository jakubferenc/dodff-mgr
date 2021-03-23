import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollupBabel } from '@rollup/plugin-babel';


export default {
  input: 'src/js/app.js',
  output: {
    file: 'dist/assets/js/app.build.js',
    format: 'iife',
    name: 'mdh',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    rollupBabel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
  ],
};
