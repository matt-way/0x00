const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/engine/index.js',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    exprContextCritical: false, // supress critical warning for require-resolve
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
    ],
  },
  plugins: [
    new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: './src/engine/index.html',
    }),
  ].filter(Boolean),
  resolve: {
    modules: ['./src', 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: './src/engine',
    },
    hot: true,
    port: 5000,
  },
}
