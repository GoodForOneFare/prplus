/* eslint-env node */
const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');

// const baseManifest = require('./chrome/manifest.json');

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
    new ExtensionReloader({
      // manifest: path.resolve(__dirname, 'chrome', 'manifest.json'),
      entries: {
        // The entries used for the content/background scripts or extension pages
        contentScript: 'build/app.js',
        background: 'build/background.js',
        extensionPage: 'build/popup.js',
      },
    }),
    // new HtmlWebpackPlugin({
    //   title: 'boilerplate', // change this to your app title
    //   meta: {
    //     charset: 'utf-8',
    //     viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
    //     'theme-color': '#000000',
    //   },
    //   manifest: 'manifest.json',
    //   filename: 'index.html',
    //   template: './static/index.html',
    //   hash: true,
    // }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'chrome', 'images'),
          to: 'images',
        },
        {
          from: 'app/**/*.css',
          to: '.',
        },
        {
          from: path.join(__dirname, 'chrome', 'background.js'),
          to: '.',
        },
        {
          from: path.join(__dirname, 'chrome', 'manifest.json'),
          to: '.',
        },
        {
          from: path.join(__dirname, 'chrome', 'popup.html'),
          to: '.',
        },
        {
          from: path.join(__dirname, 'chrome', 'popup.js'),
          to: '.',
        },
      ],
    }),
    // new WebpackExtensionManifestPlugin({
    //   config: {
    //     base: baseManifest,
    //   },
    // }),
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
              //   envName: mode,
              configFile: false,
              presets: [
                [
                  '@shopify/babel-preset/web',
                  {
                    modules: false,
                    typescript: true,
                    // browsers: 'chrome latest',
                    corejs: 3,
                  },
                ],
                '@shopify/babel-preset/react',
              ],
              //   plugins: [
              //     refresh === 'fast' && !preact && 'react-refresh/babel',
              //   ].filter(Boolean),
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
