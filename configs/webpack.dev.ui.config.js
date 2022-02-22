const path = require('path')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/ui/index.js',
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { esmodules: true },
                },
              ],
              [
                '@babel/preset-react',
                { development: true, runtime: 'automatic' },
              ],
            ],
            plugins: ['react-refresh/babel'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/ui/index.html',
    }),
  ].filter(Boolean),
  resolve: {
    modules: ['./src', 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: './src/ui',
    },
    hot: true,
  },
}
