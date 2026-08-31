const path = require('node:path');

function externalizeNodeModules({ request }, callback) {
  if (request && !request.startsWith('.') && !path.isAbsolute(request)) {
    callback(null, `commonjs ${request}`);
    return;
  }

  callback();
}

module.exports = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, 'src/main.ts'),
  output: {
    path: path.resolve(__dirname, '../dist/api'),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.app.json'),
            transpileOnly: false,
          },
        },
      },
    ],
  },
  externals: [externalizeNodeModules],
  devtool: 'source-map',
};
