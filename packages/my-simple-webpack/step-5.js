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
// let str = `
// let action = require("./action.js").action;
// let name = require("./name.js").name;
// let message = "";
// console.log(message);`
console.log(getDependencies(fileContent));
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

let result = createAsset("./index.js");
console.log(result)