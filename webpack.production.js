const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const DotEnv = require('dotenv-webpack')

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new DotEnv({ path: path.join(__dirname, '/env/.env.production') }),
  ],
})