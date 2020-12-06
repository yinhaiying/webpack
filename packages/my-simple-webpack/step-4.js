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