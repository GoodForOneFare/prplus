import babel from '@rollup/plugin-babel';

const config = {
  input: 'content_script.js',
  output: {
    file: 'build/main.js',
    format: 'iife',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      presets: [
        '@babel/preset-env',
        ['@shopify/babel-preset', {modules: 'auto', typescript: true}],
      ],
      extensions: ['.js', '.ts'],
    }),
  ],
};

export default config;
