
/* 

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






*/

const fs = require("fs");
const path = require("path");
let fileContent = fs.readFileSync("./index.js", "utf-8");

// 可以使用babylon来进行解析
function getDependencies(str) {
  let reg = /require\(['"](.+?)['"]\)/g;
  let result = null;
  let dependencies = [];
  while ((result = reg.exec(str))) {
    dependencies.push(result[1]);
  }
  return dependencies;
}
// let str = `
// let action = require("./action.js").action;
// let name = require("./name.js").name;
// let message = "";
// console.log(message);`
console.log(getDependencies(fileContent));
let ID = 0;
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

// let result = createAsset("./index.js");
// console.log(result);


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