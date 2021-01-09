const path = require('path');
const nodeExternals = require('webpack-node-externals');
const {
  NODE_ENV = 'production',
} = process.env;
module.exports = {
  entry: './src/server.ts',
  mode: NODE_ENV,
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
        modules: path.resolve(__dirname, 'src/modules/'),
        middleware: path.resolve(__dirname, 'src/middleware/'),
        private: path.resolve(__dirname, 'src/private/'),
        exceptions: path.resolve(__dirname, 'src/exceptions/'),
        utils: path.resolve(__dirname, 'src/utils/'),
        config: path.resolve(__dirname, 'src/config.ts'),
      }
    
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      }
    ]
  }
}