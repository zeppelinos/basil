const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = {
  entry: path.join(__dirname, '/src/app.js'),
  output: {
    publicPath: '/',
    filename: '[name].[hash].js',
    path: path.join(__dirname, '/dist')
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      },
      {
        test: /\.(scss|css)/,
        use: [ 'style-loader', 'css-loader', 'sass-loader' ]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.(ico|jpg|jpeg|png|svg)$/,
        loader: 'file-loader?name=images/[name].[ext]'
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ template: './src/index.template.ejs', inject: 'body', title: 'Zeppelin Basil' }),
    new webpack.optimize.CommonsChunkPlugin({ name: 'bundle' }),
    new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.$': 'jquery', 'window.jQuery': 'jquery',}),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
};

module.exports = config;
