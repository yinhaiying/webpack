
const path = require("path");
const MyDonePlugin = require("./src/myPlugins/MyDonePlugin.js");
const MyAsyncPlugin = require("./src/myPlugins/MyAsyncPlugin.js");
const HtmlWebpackPlugin =require("html-webpack-plugin");

const MyFileListPlugin = require("./src/myPlugins/MyFileListPlugin.js");
module.exports = {
    entry:"./src/index.js",
    output:{
        filename:"bundle.js",
        path:path.resolve(__dirname,"dist")
    },
    plugins:[
        new MyDonePlugin(),
        new MyAsyncPlugin(),
        new HtmlWebpackPlugin({
            template:"./src/index.html"
        }),
        new MyFileListPlugin({
            filename:"filelist.md"
        })
    ]
}