const path = require('path')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ],
  },
  entry: [path.join(__dirname, 'src/app.ts'), path.join(__dirname, 'src/styles/main.sass')],
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "public/css/[name].css",
      chunkFilename: "public/css/[id].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/img', to: './public/img' },
        { from: './src/views', to: './views' }
      ]
    })
  ],
  target: 'node',
  externals: [nodeExternals()],
  node: {
    __dirname: false
  }
}
