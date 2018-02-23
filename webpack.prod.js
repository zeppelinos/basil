const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = merge(common, {
  plugins: [
    new UglifyJSPlugin(),
    new Dotenv({
      path: './.env.production'
    })
  ]
});

module.exports = config;
