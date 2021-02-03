
const path = require("path");
const MyDonePlugin = require("./src/myPlugins/MyDonePlugin.js");
const MyAsyncPlugin = require("./src/myPlugins/MyAsyncPlugin.js");
const HtmlWebpackPlugin =require("html-webpack-plugin");

const MyFileListPlugin = require("./src/myPlugins/MyFileListPlugin.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const MyInlineSourcePlugin = require("./src/myPlugins/MyInlineSourcePlugin.js");


module.exports = {
    entry:"./src/index.js",
    output:{
        filename:"bundle.js",
        path:path.resolve(__dirname,"dist")
    },
    module:{
      rules:[
          {
              test:/\.css$/,
              use:[
                MiniCssExtractPlugin.loader,"css-loader"
              ]
          }
      ]
    },
    plugins:[
        // new MyDonePlugin(),
        // new MyAsyncPlugin(),
        new HtmlWebpackPlugin({
            template:"./src/index.html"
        }),
        // new MyFileListPlugin({
        //     filename:"filelist.md"
        // }),
        new MiniCssExtractPlugin({
            filename:"main.css"
        }),
        new MyInlineSourcePlugin({
            match:/\.(js|css)/
        })
    ]
}