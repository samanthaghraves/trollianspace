const { resolve } = require('path');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  options: {
<<<<<<< HEAD
=======
    forceEnv: process.env.NODE_ENV || 'development',
    sourceRoot: 'app/javascript',
>>>>>>> 7dd17d4e7bf91bf58e88f009bd39c94b24ae0d62
    cacheDirectory: env === 'development' ? false : resolve(__dirname, '..', '..', '..', 'tmp', 'cache', 'babel-loader'),
  },
};
