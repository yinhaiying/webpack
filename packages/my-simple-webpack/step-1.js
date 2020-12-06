
// action.js
function (require,exports){
    let action = "making webpack";
    exports.action = action;
}

// family-name.js 
function(require,exports){
    exports.name = "haiyingsitan";
}

// index.js

function(require,exports){
    let action = require("./action.js").action;
    let name = require("./name.js").name;
    let message = `${name} is ${action}`;
    console.log(message);
}

// name.js
function(require,exports){
    let familyName = require("./family-name.js").name;
    exports.name = `${familyName} Rou`;
}