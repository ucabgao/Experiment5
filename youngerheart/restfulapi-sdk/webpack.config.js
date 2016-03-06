const webpack = require('webpack');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    index: ['./src/index.js']
  },
  output: {
    path: './dist',
    publicPath: '/dist/',
    library: 'APISDK',
    libraryTarget: 'umd',
    filename: isProduction ? '[name].min.js' : '[name].js'
  },
  babel: {
    presets: ['es2015']
  },
  module: {
    preLoaders: [
      {test: /\.js$/, exclude: '/node_modules', loader: 'eslint'}
    ],
    loaders: [
      {test: /\.js$/, exclude: '/node_modules', loader: 'babel'}
    ]
  }
};
if(isProduction) {
  module.exports.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ];
}

if(process.env.NODE_ENV === 'watch') require('./server');
