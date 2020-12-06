## 实现一个简易的打包工具



### 分析：
#### 第一步：加壳
```javascript
let familyName = require("./family-name.js").name;
exports.name = `${familyName} Rou`;
```
我们看上面的一段代码，思考一下，require方法和exports对象来自哪里，肯定是有来源，我们才能够正常使用。
浏览器不能够正常使用，不就是因为浏览器中不存在requrie方法和exports对象吗？而node之所以能够直接使用，是因为node内置了CMD模块，能够获取到require和exports。既然是内置的，肯定是通过某种方法传给了这个模块，我们传值最常用的方法不就是函数吗？
因此，我们假设node是这样实现传值的。
```javascript
function (require,exports){
    let familyName = require("./family-name.js").name;
    exports.name = `${familyName} Rou`;
}
```

#### 第二步：获取加壳后的所有信息
由于我们不知道到底有多少个模块(每一个是一个模块)，由于所有的模块都会用一个函数进行包装，那么如何给这些函数命名了，肯定不能是随意命名，因此我们可以给每一个模块加一个id作为标识，使用时直接用这个id来获取这个模块，这样就避免了给这些函数命名的麻烦。
```javascript
modules = {
    // action.js
    0:function (require,exports){
        let action = "making webpack";
        exports.action = action;
    },
    // family-name.js 
    1:function(require,exports){
        exports.name = "haiyingsitan";
    },
    // index.js
    2:function(require,exports){
        let action = require("./action.js").action;
        let name = require("./name.js").name;
        let message = `${name} is ${action}`;
        console.log(message);
    },
    // name.js
    3:function(require,exports){
        let familyName = require("./family-name.js").name;
        exports.name = `${familyName} Rou`;
    }
}

```
这样的话，我们使用时直接从module中去获取模块信息。
因此，到目前为止，实际上我们就是要实现一个这样的工具，这个工具以`index.js`为入口，最终得到上面的`module`对象。
#### 第三步：执行方法
3. 需要一个执行方法，来通过moduleId来获取这些函数，然后执行。
```javascript
function exec(id){
    let fn = module[id];
    exports = {};

    function require(path){
        // todo:
        // 根据模块路径，返回模块执行的结果
    }
    fn(require,module.exports)
}
exec(0);
```
`exec`函数就是用来通过id，获取到模块，然后这个函数里面有`require`方法和`exports`对象,通过将`require`和`exports`对象传递给每个模块形成的函数，然后执行这个函数。

#### 第四步： 如何实现require方法
`exports`只是对象，不需要去思考如何实现，但是`require`这个函数应该如何去实现了。事实上，require的功能就是根据一个路径去找到一个模块，然后获取到模块的内容。但是此时如何去查找一个模块了。
```javascript
modules = {
    // action.js
    0:function (require,exports){
        let action = "making webpack";
        exports.action = action;
    },
    // family-name.js 
    1:function(require,exports){
        exports.name = "haiyingsitan";
    },
    // index.js
    2:function(require,exports){
        let action = require("./action.js").action;
        let name = require("./name.js").name;
        let message = `${name} is ${action}`;
        console.log(message);
    },
    // name.js
    3:function(require,exports){
        let familyName = require("./family-name.js").name;
        exports.name = `${familyName} Rou`;
    }
}
```
我们都知道目前所有的模块只有moduleId,没有所谓的模块名字。那么我们只能通过modules对象moduleId进行获取。以`index.js`为例：
```javascript
function(require,exports){
    let action = require("./action.js").action;   // action.js模块id是0
    let name = require("./name.js").name;         // name.js模块id是3
    let message = `${name} is ${action}`;
    console.log(message);
}
```
上面的`require("./action.js")`需要根据`./action.js`拿到它的moduleId,因此我们可不可以在一开始就把函数中require引入的所有模块的id都记录下来，然后到时候直接查找。我们修改一下modules对象。
```javascript
modules = {
  // action.js
  0: [
    function (require, exports) {
      let action = "making webpack";
      exports.action = action;
    },
    {},
  ],
  // family-name.js
  1: [
    function (require, exports) {
      exports.name = "haiyingsitan";
    },
    {},
  ],
  // index.js
  2: [
    function (require, exports) {
      let action = require("./action.js").action;
      let name = require("./name.js").name;
      let message = `${name} is ${action}`;
      console.log(message);
    },
    {
      "./action.js": 0,
      "./name.js": 3,
    },
  ],
  // name.js
  3: [
    function (require, exports) {
      console.log('这里执行了吗')
      let familyName = require("./family-name.js").name;
      exports.name = `${familyName}`;
    },
    {
      "./family-name.js": 1,
    },
  ],
};
```
修改后的modules不仅仅记录了每一个模块，还记录了每个模块中引用的其他模块及其对应的模块id。这样的话执行时，直接通过
这个模块id就可以快速地找到对应的模块，然后执行这个模块获得相对应的内容(这里的内容就是exports)。
同理：我们需要修改一下执行的`exec`方法。
```javascript
function exec(id) {
  console.log("id:",id)
  let [fn, mapping] = modules[id];
  let exports = {};
  fn && fn(require, exports);
  function require(path) {
    return exec(mapping[path]);
  }
  console.log("exports:", exports);
  // 返回的就是对exports做的处理
  return exports;
}

exec(2);
```
到目前为止，我们其实实现了一个很重要的功能，能够以index.js为入口，通过分析得到下面这个文件。
```javascript

// 生成modules
modules = {
  // action.js
  0: [
    function (require, exports) {
      let action = "making webpack";
      exports.action = action;
    },
    {},
  ],
  // family-name.js
  1: [
    function (require, exports) {
      exports.name = "haiyingsitan";
    },
    {},
  ],
  // index.js
  2: [
    function (require, exports) {
      let action = require("./action.js").action;
      let name = require("./name.js").name;
      let message = `${name} is ${action}`;
      console.log(message);
    },
    {
      "./action.js": 0,
      "./name.js": 3,
    },
  ],
  // name.js
  3: [
    function (require, exports) {
      console.log('这里执行了吗')
      let familyName = require("./family-name.js").name;
      exports.name = `${familyName}`;
    },
    {
      "./family-name.js": 1,
    },
  ],
};

// 执行函数
function exec(id) {
  console.log("id:",id)
  let [fn, mapping] = modules[id];
  let exports = {};
  fn && fn(require, exports);
  function require(path) {
    console.log("exports:",exports);
    return exec(mapping[path]);
  }
  console.log("exports:", exports);
  // 返回的就是对exports做的处理
  return exports;
}
exec(2);
```
这个文件由两部分组成：生成modules和exec函数。其中exec函数是不变的，因为对所有的模块都是做相同的处理。
唯一是变量的就是modules的生成。因此，接下来的重点就是：需要一个工具，实现从index.js入口文件开始，一次分析所有
的依赖，最后得到modules对象,然后生成到一个文件中。

#### 第五步： 依赖解析与创建资源对象
将一个文件进行解析，获取到它的依赖，然后创建一个对象用来描述这个文件信息。
```javascript
const fs = require("fs");
let fileContent = fs.readFileSync("./index.js","utf-8");

// 可以使用babylon来进行解析
function getDependencies(str){
    let reg = /require\(['"](.+?)['"]\)/g;
    let result = null;
    let dependencies = [];
    while(result = reg.exec(str)){
        dependencies.push(result[1]);
    }
    return dependencies;
}
console.log(getDependencies(fileContent));   // [ './action.js', './name.js' ]
let ID = 0;
function createAsset(filename){
  let fileContent = fs.readFileSync(filename,'utf-8');
  const id = ID++;
  return {
    id: id,
    filename: filename,
    dependencies: getDependencies(fileContent),
    code:`function(require,exports,module){
        ${fileContent}
    }`
  };
}
```
这个对象包括：模块id，文件名，模块依赖以及模块的代码字符串。
```json
{ id: 0,
  filename: './index.js',
  dependencies: [ './action.js', './name.js' ],
  code:'function(require,exports,module){\n let action = require("./action.js").action;\r\nlet name = require("./name.js").name;\r\nlet message = `${name} is ${action}`;\r\nconsole.log(message);\n    }'
}
```

#### 第六步： 找出模块的所有依赖
通过上面的对象，我们可以知道,`dependencies`还有两个依赖`./action.js`和`./name.js`。因此，我们还需要将这两个模块转换成对象。
当获取到`./action.js`的对应的模块描述对象和`./name.js`的对应的模块描述对象之后，我们需要将其和模块id映射到当前模块中。即新增一个`mapping`字段用来描述当前模块所有依赖及其模块id的对应关系。也就是说我们最终实际上是要实现下面这样一个数组。

```javascript
[
    {   id: 0,
        filename: './index.js',
        dependencies: [ './action.js', './name.js' ],
        code:'function(require,exports,module){\n let action = require("./action.js").action;\r\nlet name = require("./name.js").name;\r\nlet message = `${name} is ${action}`;\r\nconsole.log(message);\n    }'
        mapping:{"./action.js":1,"./name.js":2}
    },
    {   id: 1,
        filename: './action.js',
        dependencies: [],
        code:'function(require,exports,module){let action = "making webpack";exports.action = action;}'
    },
    {   id: 2,
        filename: './name.js',
        dependencies: [./family-name.js],
        code:'function(require,exports,module){let familyName = require("./family-name.js").name;exports.name = `${familyName} Rou`;}'
    },
]
```
最终的实现函数如下：
```javascript
function createGraph(filename){
    let asset = createAsset(filename);
    let queue = [asset];
    // 使用let of 进行遍历，是因为我们在遍历过程中会往数组中添加元素，而let of会继续遍历新添加的元素，而不需要像for循环那样，需要进行处理。
    for(let queue of asset){
        const dirname = path.dirname(asset.filename);
        asset.mapping = {};
        asset.dependencies.forEach((relativePath) => {
            const absolutePath = path.join(dirname,relativePath);
            const child = createAsset(absolutePath);
            asset.mapping[relativePath] = child.id;
            queue.push(child);
        })
    }
}
```

#### 第七步：打包生成最后的文件
我们的目的最后就是生成这样的一个文件：
```javascript
(function (modules) {
  function exec(id) {
    let [fn, mapping] = modules[id];
    let exports = {};
    fn && fn(require, exports);
    function require(path) {
      console.log("exports:", exports);
      return exec(mapping[path]);
    }
    console.log("exports:", exports);
    return exports;
  }
  exec(0);
})({
  4: [
    function (require, exports, module) {
      let action = require("./action.js").action;
      let name = require("./name.js").name;
      let message = `${name} is ${action}`;
      console.log(message);
    },
    { "./action.js": 5, "./name.js": 6 },
  ],
  5: [
    function (require, exports, module) {
      let action = "making webpack";
      exports.action = action;
    },
    {},
  ],
  6: [
    function (require, exports, module) {
      let familyName = require("./family-name.js").name;
      exports.name = `${familyName} Rou`;
    },
    { "./family-name.js": 7 },
  ],
  7: [
    function (require, exports, module) {
      exports.name = "haiyingsitan";
    },
    {},
  ],
});
```
实现：在拿到所有模块生成的大数组之后，我们就可以将其组装成我们之前想要的形式。
```javascript
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

  fs.writeFileSync("../dist/bundle.js",result);
}

```