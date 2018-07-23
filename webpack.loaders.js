const path = require('path');


// noinspection WebpackConfigHighlighting
module.exports = [
  // =========
  // = Babel =
  // =========
  // Load jsx extensions with babel so we can use
  // 'import' instead of 'require' and es6 syntax
  {
    test: /\.jsx?$/,
    include: path.resolve(__dirname, 'src'),
    loader: "babel-loader",
    options: {
      // This is a feature of `babel-loader` for Webpack (not Babel itself).
      // It enables caching results in ./node_modules/.cache/babel-loader/
      // directory for faster rebuilds.
      cacheDirectory: true,
      plugins: ['react-hot-loader/babel'],
    }
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    exclude: path.resolve(__dirname, "node_modules"),
    use: [
      {
        loader: "url-loader",
        options: {
          prefix: "font",
          limit: 10000,
          mimetype: "application/octet-stream"
        }
      }
    ]
  },
  // ==========
  // = Styles =
  // ==========
  // Global CSS (from node_modules)
  // ==============================
  {
    test: /\.css/,
    include: path.resolve(__dirname, "node_modules"),
    use: [
      {
        loader: "style-loader"
      },
      {
        loader: 'css-loader'
      }
    ]
  },
];
