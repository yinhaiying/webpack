(function(modules){
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
  })({0:[
        function(require,exports,module){
        let action = require("./action.js").action;
let name = require("./name.js").name;
let css = require("./style.css");
let message = `${name} is ${action}`;
console.log(message);
    },
        {"./action.js":1,"./name.js":2,"./style.css":3}
    ],1:[
        function(require,exports,module){
        let action = "making webpack";
exports.action = action;
    },
        {}
    ],2:[
        function(require,exports,module){
        let familyName = require("./family-name.js").name;
exports.name = `${familyName} Rou`;
    },
        {"./family-name.js":4}
    ],3:[
        function(require,exports,module){
        
      const str = "body{\r\n    background:red;\r\n}";
      if (document) {
        const style = document.createElement('style');
        style.innerHTML = str;
        document.head.appendChild(style);
      }
      module.exports= str;
    
    },
        {}
    ],4:[
        function(require,exports,module){
        exports.name = "haiyingsitan";
    },
        {}
    ],})