const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      filename: isProduction ? 'payment-button.min.js' : 'payment-button.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
              ]
            }
          }
        },
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
              ]
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body'
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      hot: true,
      open: true
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};