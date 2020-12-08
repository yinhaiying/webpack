const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "./src/loaders/replace-loader.js",
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
