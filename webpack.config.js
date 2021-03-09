'use strict';

const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const webpackConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? undefined : 'source-map',
  entry: {
    app: ['./src/client/index.jsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/js/',
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: '/.html$/',
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {},
    extensions: ['.js', '.jsx', '.json'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/client/index.html',
      filename: path.join(__dirname, 'public', 'index.html'),
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
  ],
};

if (!isProduction) {
  const cog = require('./cog');

  webpackConfig.devServer = {
    contentBase: path.join(__dirname, 'public'),
    port: cog.port,
    host: 'localhost',
  };

  webpackConfig.optimization = {
    minimizer: false,
  };
}

if (isProduction) {
  webpackConfig.optimization = {
    minimizer: [new TerserPlugin()],
  };
}

module.exports = webpackConfig;
