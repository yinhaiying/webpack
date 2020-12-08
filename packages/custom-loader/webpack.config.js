const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.js",
    resolveLoader: {
        alias: {
            "replace-name-loader": path.resolve(__dirname, "src/loaders/replace-name-loader.js"),
            "replace-age-loader": path.resolve(__dirname, "src/loaders/replace-age-loader.js"),
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["replace-name-loader", "replace-age-loader"]
            }
        ],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
    },
};