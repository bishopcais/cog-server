const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const cog = require('./cog');

const isProduction = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const webpackConfig = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    app: [
      './src/client/index.jsx',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/js/',
    chunkFilename: '[name].bundle.js',
    filename: `[name].bundle.js`,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
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
  webpackConfig.devServer = {
    contentBase: path.join(__dirname, 'public'),
    port: cog.port,
    host: 'localhost',
  };
}

module.exports = webpackConfig;

/*
const path = require('path');

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: 8080,
        host: `localhost`,
    },
    entry: {
        app: [
            './src_client/index.js'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/js/',
        filename: `[name].js`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        'modules': 'false',//commonjs,amd,umd,systemjs,auto
                                        'useBuiltIns': 'usage',
                                        'targets': '> 0.25%, not dead',
                                        'corejs': 3
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {}
    },
    plugins: [],

};
*/
