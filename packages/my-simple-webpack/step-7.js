/* 
打包生成最后的一个文件。


*/


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

let result = createGraph("./index.js");
console.log("result:",result)


// 打包成最终形式:包含所有模块信息的模块对象和模块执行函数
/* 
 0:[
     function(require,exports,module){let familyName = require("./family-name.js").name;exports.name = `${familyName} Rou`;},
     {"./action.js":1,"./name.js":2}
 ],
 1:[],



*/
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

let graph = createGraph("./index.js");
createBundle(graph);