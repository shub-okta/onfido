const { merge } = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const common = require('./webpack.common')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const DotEnv = require('dotenv-webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    publicPath: '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
    new CleanWebpackPlugin(),
    new DotEnv({ path: path.join(__dirname, '/env/.env.development') })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    liveReload: true,
    port: 3000,
    historyApiFallback: true,
    writeToDisk: true,
  }
})