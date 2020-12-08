const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  resolveLoader: {
    // alias: {
    //   "replace-loader": path.resolve(__dirname, "src/loaders/replace-loader.js"),
    // },
    modules: ['node_modules', './src/loaders']
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      use: {
        loader: "replace-loader",
        options:{
          name:"刘亦菲",
          age:22
        }
      }
    }
  ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};