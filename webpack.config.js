/* eslint-env node */
const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

const chromeRoot = path.resolve(__dirname, 'chrome');

const config = {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-module-source-map',
  entry: {
    app: path.join(__dirname, 'app', 'main.ts'),
  },
  output: {
    chunkFilename: '[name].js',
    filename: '[name].js',
    path: path.resolve(__dirname, './build'),
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(chromeRoot, 'images'),
          to: 'images',
        },
        {
          from: 'app/**/*.css',
          to: '.',
        },
        {
          from: path.join(chromeRoot, 'manifest.json'),
          to: '.',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: false,
              presets: [
                [
                  '@shopify/babel-preset/web',
                  {
                    modules: false,
                    typescript: true,
                    corejs: 3,
                  },
                ],
                '@shopify/babel-preset/react',
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
    ],
  },
};
module.exports = config;
