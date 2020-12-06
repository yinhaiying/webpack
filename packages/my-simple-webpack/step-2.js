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