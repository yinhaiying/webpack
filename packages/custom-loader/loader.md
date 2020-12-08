# 深入理解webpack中的loader


## webpack系列文章
1. [实现一个简易的模块打包器](https://juejin.cn/post/6893809205183479822#heading-14)


## 前言
在之前的文章中，我们已经实现了一个[简易的webpack打包器],但是在文章的最后，我们也提到过我们的打包器功能并不完善，比如我们目前不支持内置模块的引入，不支持ES6语法的转换，不支持css文件的打包。但是这些功能都可以通过webpack提供的loader和plugin等进行处理。这一篇文章我们就来聊一聊webpack中的核心功能之loader。还是我之前提到过的理念，你想要真正地了解一个东西，最好的办法就是去实现它，哪怕功能是最简单的。因此，本文我们同样会基于这个思路，手动去实现一个loader。<br/>
在[简易的webpack模块打包器]中，我们还不支持处理css文件。因此，首先我们先实现这个功能。为了便于大家直接使用代码，这里直接把之前的代码贴在下面。
```javascript
const fs = require("fs");
const path = require("path");
// 获取依赖
function getDependencies(str) {
  let reg = /require\(['"](.+?)['"]\)/g;
  let result = null;
  let dependencies = [];
  while ((result = reg.exec(str))) {
    dependencies.push(result[1]);
  }
  return dependencies;
}
let ID = 0;
// 将每个模块转成对象描述形式
function createAsset(filename) {
    // readFileSync  读取文件  最好传递绝对路径
  let fileContent = fs.readFileSync(filename, "utf-8");
  const id = ID++;
  return {
    id: id,
    filename: filename,
    dependencies: getDependencies(fileContent),
    code: `function(require,exports,module){
        ${fileContent}
    }`,
  };
}

// 解析所有的模块得到一个大的数组对象。
function createGraph(filename){
    let asset = createAsset(filename);
    let queue = [asset];
    // 使用let of 进行遍历，是因为我们在遍历过程中会往数组中添加元素，而let of会继续遍历新添加的元素，而不需要像for循环那样，需要进行处理。
    for(let asset of queue){
        const dirname = path.dirname(asset.filename);
        asset.mapping = {};
        asset.dependencies.forEach((relativePath) => {
            const absolutePath = path.join(dirname,relativePath);
            const child = createAsset(absolutePath);
            asset.mapping[relativePath] = child.id;
            queue.push(child);
        })
    }
    return queue;
}

function createBundle(graph){
  let modules = "";
  graph.forEach((mod) => {
    modules += `${mod.id}:[
        ${mod.code},
        ${JSON.stringify(mod.mapping)}
    ],`;
  });

  const result = `(function(modules){
    function exec(id) {
        let [fn, mapping] = modules[id];
        let exports = {};
        fn && fn(require, exports);
        function require(path) {
            console.log("exports:",exports);
            return exec(mapping[path]);
        }
        console.log("exports:", exports);
        return exports;
    }
    exec(0);
  })({${modules}})`;
// 看这里，看这里，看这里 修改打包后的地址
  fs.writeFileSync("./dist/bundle.js",result);
}
// 看这里，看这里，看这里 你可以传入你自己的入口文件
let graph = createGraph("./index.js");
createBundle(graph);
```
大家拿到上面的代码之后，如果你想要自己进行测试，只需要修改入口文件和最终的打包文件地址即可。也就是下面这两行代码。
```javascript
let graph = createGraph("./index.js");
fs.writeFileSync("./dist/bundle.js",result);
```
当然，大家也可以去我的[github](https://github.com/yinhaiying/webpack/tree/main/packages/my-simple-webpack)仓库中进行查找。`step-7.js`就是之前最终的代码，也是我们本节课的初始代码。


## 增加打包css的功能
我们知道无论是webpack也好还是其他的打包器，都是只能打包js文件的，那么对于其他的一些比如css文件，img文件，txt文件等它又是如何打包的。


## 参考文献：
[自定义loader](https://juejin.cn/post/6882895689773383694#heading-0)
[how to write a loader](https://webpack.js.org/contribute/writing-a-loader/)
## loader的配置：
如果不需要传递参数(也就是配置信息)
```javascript
     {
        test: /\.js$/,
        use: "./src/loaders/replace-loader.js",
    },

```
如果需要传递参数：
```javascript
    {
        test:/\.js$/,
        use:{
            loader:"replaceLoader",
            options:{
                params:"哈哈，这是一个替换loader"
            }
        }
    }


```
## loader如何接收参数：
如果我们想要给loader传递参数，我们在配置信息里给出参数
```javascript
    {
        test:/\.js$/,
        use:{
            loader:"replaceLoader",
            options:{
                params:"哈哈，这是一个替换loader"
            }
        }
    }
```
但是loader函数如何接收了，我们知道Loader接收一个参数，是读取的文件内容，那新增的这些参数是写在第一个参数后面吗？
```javascript
module.exports = function(source,...rest)  {
    console.log("source:");
    console.log(source);
    console.log("rest:",rest);   /// undefined 
    const content = source.replace("海英","海英斯坦").replace("18","28");
    return content;
}
```
我们发现最终获取到的参数是空的，也就是说webpack不是把配置信息当作参数放到loader中。
事实上，webpack是通过把参数放到this中(因此，loade最好不要使用箭头函数)，通过this.query来进行获取。
```javascript

module.exports = function(source)  {
    console.log("query:", this.query); // { params: '哈哈哈哈，这是一个用于替换的loader' }
    const content = source.replace("海英","海英斯坦").replace("18","28");
    return content;
}
```
但是，webpack更加推荐使用loader-utils模块来获取,它提供了许多有用的工具，最常用的一种工具是获取传递给loader的选项。


## this.callback()
在一些情况下，我们返回的是原来内容转换后的内容，但是我们可能还需要返回其他的东西，比如我们可能还想要生成sourceMap文件，
这时候不能直接返回这两个东西，而是需要使用webpack提供的this.callback方法，
```javascript
module.exports = function(source)  {
    console.log("params",getOptions(this).params)
    const content = source.replace("海英","海英斯坦").replace("18","28");
    this.callback(null,content,sourceMap)
}
```
事实上我们都可以不通过return，而是所有的返回都通过this.callback来实现
```name
module.exports = function(source)  {
    console.log("params",getOptions(this).params)
    const content = source.replace("海英","海英斯坦").replace("18","28");
    this.callback(null,content)
}
```

## webpack中resolveLoader的使用方法
