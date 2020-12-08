# 这一次彻底搞懂webpack中的loader


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

## 支持打包css文件
我们一直都知道模块打包器只支持打包js文件，打包其他文件需要使用对应的loader，但是大家有没有想过到底是为什么不支持了？明明我的模块打包器也能够加载这些文件啊。实践出真知，最好的办法就是去试一下。因此，我们首先编写一个style.css文件，里面只写如下的简单样式，然后在其他文件中进行引入。
```css
body{
  background:red;
}
```
然后，我们查看一下打包的样子：
```javascript
    3: [
        function (require, exports, module) {
            body {
                background: red;
            }
        },
        {}
    ]
```
我们可以发现，打包后变成这样了，也就是跟其他的js文件一样，直接讲css样式，包裹在一个函数中了。这些css文件内容肯定不能作为js的函数的内容进行执行，原来这就是只支持打包js文件的原因(因为所有的内容最后都会放到js函数中来执行,非js内容不能执行，因此就不能打包)。既然我们知道了非js内容不能执行，那么我们可不可以再进一步把加载的内容变成js支持的。比如我们能不能用一个变量来接收这些内容，这样不就是一个普通的js语句了嘛。类似于如下：
```javascript
  3: [
        function (require, exports, module) {
            const str = `body {   // 看这里，看这里
                background: red;
            }`
        },
        {}
    ]
```
根据上面的思路，我们拿到非js的文件，就给个变量来接收一下它。这里我们就处理一下css后缀的文件。
```javascript
function createAsset(filename) {
  let fileContent = fs.readFileSync(filename, "utf-8");
  // 处理一下css文件
  if (/\.css$/.test(filename)) {
    console.log("说明是css文件")
    fileContent = `
      const str = ${JSON.stringify(fileContent)};
      module.exports= str;
    `
  }
}
```
如上面代码所示,我们在`createAsset`函数中，拿到文件名之后先判断是不是css文件，如果是就通过一个变量来接收它，然后导出这个变量。我们看下最终打包后的效果。
```javascript
    3: [
        function (require, exports, module) {
        // 打包后的代码
            const str = "body{\r\n    background:red;\r\n}";
            module.exports = str;
        },
        {}
    ],
```
我们可以看到，打包后就是正常的js语句了，而且直接通过exports导出，需要使用时，直接引入即可。**好了，到目前为止我们已经实现了能够加载`.css`后缀的文件了。但是我们拿到css之后怎么使用了，我们平常使用样式，通常是行内使用，通过link引入和style标签使用。这里我们没法通过行内和link标签进行使用。但是我们可以创建一个style标签，然后把标签的内容替换为刚刚导出的css文件内容。代码如下：
```javascript
  if (/\.css$/.test(filename)) {
    console.log("说明是css文件")
    fileContent = `
      const str = ${JSON.stringify(fileContent)};
      if (document) {
        //看这里，看这里 创建style标签，然后插入到head中
        const style = document.createElement('style');
        style.innerHTML = str;
        document.head.appendChild(style);
      }
      module.exports= str;
    `
  }
```
然后我们将打包后的文件放入一个Html文件中，在浏览器中打开就可以看到整个背景都变成红色了。也就是说我们实现了我们想要的功能。接下来我们把我们这部分代码，单独抽离出来作为一个函数进行导出：<br>
**loader/css.js**
```javascript
const processCss = function (fileContent) {
    return `
      const str = ${JSON.stringify(fileContent)};
      if (document) {
        const style = document.createElement('style');
        style.innerHTML = str;
        document.head.appendChild(style);
      }
      module.exports= str;
    `
}
module.exports = processCss;
```
将上面的函数在之前的文件中引入使用:
```javascript
  if (/\.css$/.test(filename)) {
    fileContent = process(fileContent)
  }
```
好了，到目前为止我们已经支持打包css文件了。事实上这就是`css-loader`和`style-loader`实现的功能。可能大家会觉得奇怪，我们只是写了一个`process`函数，代码还不到十行，这就是一个loader？答案是肯定的，这就是一个loader，只是我们的loader不太标准，webpack定义的loader需要遵循单一功能原则，也就是一个loader只实现一个功能，这里我们的loader实现了两个功能：1. 处理css文件 2. 将css文件插入到style标签中。而且，还有更加简单的loader了，官方推荐的row-loader核心代码就一行。如下图所示：
![row-loader](https://ftp.bmp.ovh/imgs/2020/12/9b52060811f90289.jpg)
虽然我们的loader不正规，但是我们把对loader的理解一下子从很高深的概念抽象为一个函数，即**loader就是一个简单的函数。**

## 自定义一个loader
上面说了这么多，最终只是为了得到一个结论：**loader是一个简单的函数**。所以如果你们不愿意看上面的代码，那么记住这个结论也行。接下来我们就实现一个自定义的loader。**我们实现一个替换文件中姓名和年龄的loader**。<br/>
分别有如下文件：<br>
name.js
```javascript
export const name = "小明";
```
age.js
```javascript
export const age = 18;
```
index.js
```javascript
import { name} from "./name.js";
import {age} from "./age.js";
function showInfo(){
    console.log(`${name}的年龄是${age}岁`);
}
showInfo();
```
如果正常运行代码，最终的输出应该是：
```javascript
小明的年龄是18岁
```
我们现在希望替换小明为黄晓明，年龄从18替换为38。
### 创建replace-loader
我们通过在loaders/replace.js中定义一个函数(我们知道loader就是一个函数)，实现代码如下：
```javascript
module.exports = function(source)  {
    // source就是读取文件的内容
    const content = source.replace("小明","黄晓明").replace("18","38");
    return content;
}
```
### 使用loader
创建了loader，接下来我们就需要再webpack中使用了。创建一个webpack.config.json文件，配置如下：
```javascript
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "./src/loaders/replace-loader.js",   // 看这里，看这里
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
```
我们需要处理js文件，因此我们需要给js文件配置规则，我们使用自己的loader去处理js文件。
```javascript
    rules: [
      {
        test: /\.js$/,
        use: "./src/loaders/replace-loader.js",   // 看这里，看这里
      },
    ],
```
然后运行`npx webpack`，(注意需要安装webpack和webpack-cli)。查看打包后的文件。
```javascript
(()=>{"use strict";console.log("黄晓明的年龄是38岁")})();
```
我们可以发现打包后的内容被替换了：小明被替换成了黄晓明，年龄18岁被替换成了38岁。顺利实现了我们想要的功能。这里我们需要注意的引入loader的方式：由于我们使用的是本地的loader，因此需要填写本地的路径。loader的引入主要有以下几种方式：

### 引入loader的方式
1.如果是npm包安装的loader，那么直接写loader名称即可。
```javascript
 {
    test: /\.js$/,
    use: 'babel-loader',
 }
```
2. 如果是本地自定义的loader，那么需要写本地loader的地址
```javascript
  {
    test: /\.js$/,
    use: "./src/loaders/replace-loader.js",
  }
```
3. 如果是本地自定义loader，然后也想直接使用loader名称，那么可以取个别名
```javascript
const path = require("path");

module.exports = {

  resolveLoader: {
  // 取个别名
    alias: {
      "replace-loader": path.resolve(__dirname, "src/loaders/replace-loader.js"),
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: "replace-loader",
    }, ],
  },
};
```
4. 如果你不想取别名还想，还想直接使用loader，那么就定义一下loader的查找位置。loader默认会先从node_modules中查找。如果我们希望它也能够到本地查找，那么就定义一下查找位置。
```javascript
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './src/loaders'], // node_modules找不到，就去./src/loaders找
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'replace-loader',
      },
    ],
  },
}
```
### loader传入参数
我们发现我们上面的功能是将小明替换成黄晓明，年龄18替换成28。但是假如我们希望将名字替换成刘亦菲，替换成杨幂，那么难道我们每次都在loader中去修改吗？这肯定不会。因此，我们需要支持配置参数，loader的支持通过options进行配置：
```javascript
    {
      test: /\.js$/,
      use: {
        loader: "replace-loader",
        options:{
          name:"刘亦菲"
        }
      }
    }
```
但是，在`webpack.config.json`中配置好了，在loader中如何获取了。既然我们的loader是一个函数，它的第一个参数是读取的文件的内容，那么会不会把传入的参数放到后面了，我们是当做参数获取吗？我们可以先尝试一下：
```javascript
module.exports = function(source,...rest)  {
    console.log("rest",rest)  // [] 得到的是空的数组
    const content = source.replace("小明","黄晓明").replace("18","38");
    return content;
}
```
我们可以发现，我们无法在参数中获取到传过来的参数。事实上，webpack官方文档[如何编写一个loader](https://webpack.js.org/contribute/writing-a-loader/)中说明了loader只接收一个参数，这个参数是读取的文件内容。webpack会把所有的信息都放到上下文`this`中，我们可以通过`this.query`进行获取，这也是为什么不建议把loader定义成一个箭头函数。
```javascript
module.exports = function(source)  {
    console.log("query:",this.query);  // {name:"刘亦菲",age:22}
    let {name ,age} = this.query;
    const content = source.replace("小明",name).replace("18",age);
    return content;
}
```
虽然我们可以通过`this.query`来进行获取,但是webpack更加推荐使用`loader-utils`来进行操作,它提供了许多有用的工具，最常用的一种工具是获取传递给 loader 的选项。
1. 安装
```javascript
npm i loader-utils -D
```
2. 使用
```javascript
const { getOptions } = require('loader-utils')
module.exports = function(source)  {
    let {name,age} = getOptions(this);
    const content = source.replace("小明",name).replace("18",age);
    return content;
}
```
`loader-utils`模块中还封装了其他的一些工具方法，这些工具方法是我们在编写loader时常用的。

### loader返回值
loader的返回值涉及到一个还是多个返回值。有些情况下，比如我们需要返回sourceMap，那么就需要多个返回值。
1. 1个返回值且，可以直接使用return。
```javascript
const { getOptions } = require('loader-utils')
module.exports = function(source)  {
    let {name,age} = getOptions(this);
    const content = source.replace("小明",name).replace("18",age);
    return content;   // 返回一个值
}
```
2. 如果有多个值需要返回，需要使用loader本身提供的回调函数callback。
```javascript
const { getOptions} = require('loader-utils');
const { SourceMap } = require('module');
module.exports = function(source,)  {
    let {name,age} = getOptions(this);
    const content = source.replace("小明",name).replace("18",age);
    this.callback(null,content,SourceMap)
}
```
callback支持的参数如下：
```javascript
callback({
    // 报错
    error: Error | Null,
    // 转换后的内容
    content: String | Buffer,
    // 转换后的内容得出的sourceMap
    sourceMap?: SourceMap,
    // ast
    abstractSyntaxTree?: AST 
})
```
事实上，如果只有一个返回值，我们也可以直接使用this.callback。
```javascript
this.callback(null,content)
```

### 同步异步loader
对于同步的loader，我们直接使用return 或者this.callback进行返回，但是对于异步loader我们可以自己使用async和await进行处理。
1. 使用async和await进行处理
```javascript
module.exports = async function(source)  {
    let {name,age} = getOptions(this);
    // 这里其实不是异步的，只是作为示例，可以这样处理
    const content =  await source.replace("小明",name).replace("18",age);
    return content;
}
```
2. 使用loader提供的this.async进行处理
```javascript
module.exports =  function(source)  {
    let {name,age} = getOptions(this);
    const content =  source.replace("小明",name).replace("18",age);
    this.async(null, content, SourceMap)   // async用来处理异步loader
}
```
### loader的单一功能原则
在`webpack`官网的[如何编写一个loader](https://webpack.js.org/contribute/writing-a-loader/)中提到，webpack的loader编写遵循单一功能原则，也就是loader只能实现一个功能。比如less-loader用来处理less文件，css-loader用来处理css文件，style-loader用来将样式插入到style标签中，这些功能虽然可以放到一个loader中实现，但是为了确保loader的功能纯粹，能够让不同loader各司其职，同时进行功能组合，最好每个loader只负责一个功能。这里我们也将我们的replace-loader的功能进行拆分，拆分成replace-name-loader和replace-age-loader分别用来替换姓名和年龄。拆分后的loader如下：<br>
**loaders/replace-name-loader.js**
```javascript
module.exports = function (source) {
    console.log("处理name的loader");
    const content = source.replace("小明", "黄晓明");
    return this.callback(null, content)
}
```
**loaders/replace-age-loader.js**
```javascript
module.exports = function (source) {
    console.log("处理age的loader");
    const content = source.replace("18", "28");
    return this.callback(null, content)
}
```
既然，修改了loader，那么毫无疑问我们需要修改`webpack.config.js`的配置文件中loader的配置。
### 多个loader如何进行使用
我们现在已经有了两个loader，分别为`replace-name-loader`和`replace-age-loader`，但是多个loader之前如何处理数据了？是拿到同一份内容，分别进行处理，然后再合并。还是拿到上一个loader处理后的内容，然后下一个loader再进行处理,如果是这样的话，那么loader是具有顺序的。事实上，[如何编写一个loader](https://webpack.js.org/contribute/writing-a-loader/)官方文档中指出：当有多个loader时，从左往右(或者从上往下)的顺序编写loader，最终会按照相反的顺序，也就是从右到左(或者从下到上)的顺序，执行对应的loader。其中：
 - 最后的一个loader，第一个被调用，它将接受文件最原始的内容
 - 第一个loader，最后一个被调用，它将接收最终的javascript文件和可选的sourceMap文件
 - 中间的loader，只接收上一个loader返回的文件内容
 
也就是说，我们配置的loader的顺序是：["replace-name-loader", "replace-age-loader"]，最终执行的顺序是：`replace-age-loader`然后执行`replace-name-loader`。
修改后的配置如下：
```javascript
module.exports = {
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
    }
};
```
我们打印出文件的内容，发现在`replace-name-loader`获取的文件内容中得到的已经是年龄替换后的内容，也就是`replace-age-loader`处理后的内容。

## 总结
好了，到目前为止，我们基本上已经讲解完了一个loader所需的所有内容。主要包括：
1、首先我们通过自己实现了一个跟css-loader和style-loader功能相似的函数，说明了实际上就是一个函数。<br>
2、然后我们自定义了一个replace-loader,并且从零开始逐步丰富这个loader的内容。主要包括：<br>
  - 如何实现loader的功能——定义一个函数，接收文件内容，返回处理后的文件内容
  - loader的引入方式——第三方loader和自定义loader的几种引入方式
  - loader如何支持配置参数，以及如何去获取参数——通过this和`loader-utils`进行获取
  - loader如何返回值——返回一个值和返回多个值的处理
  - 同步loader和异步loader的处理
  - 多个loader之间如何使用以及他们的调用顺序影响

通过上面的方式，先引出loader，然后慢慢地实现一个loader，在实现的过程中逐步介绍loader的功能和配置，这样的话就能够在脑海中逐步建立起loader的知识框架，而不再是像以前一样，觉得loader很高深，从而望而生畏。还是那句话，**学习一个东西最好的方法就是去实现它**。<br>
相关的代码大家可以在[github](https://github.com/yinhaiying/webpack/tree/main/packages/custom-loader)中进行查看。欢迎star。
完结撒花。

## 参考文献：
[how to write a loader](https://webpack.js.org/contribute/writing-a-loader/)
[loader官网](https://webpack.js.org/loaders/)






