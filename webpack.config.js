const Path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    cli: Path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    filename: 'productive-cli',
    path: Path.resolve(__dirname, 'build'),
  },
  plugins: [new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })],
  target: 'node',
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
};
