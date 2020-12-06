/* 
第二步：打包成一个什么样的文件：
1. 获取到所有模块
2. 用函数执行所有模块，从入口模块开始执行

*/

var depRelation = [
    {
        key:"index.js",
        deps:["a.js","b.js"],
        code:function(){}
    },
    {
        key:"a.js",
        deps:["b.js"],
        code:function(){}
    },
    {
        key:"b.js",
        deps:["a.js"],
        code:function(){}
    },
]

// 为什么要把depRelation从对象改成数组。因为数组的第一项就是入口，而对象没有第一项的概念

execute(depRelation[0].key);


const modules = {};
function execute(key){
    if(modules[key]){
        return modules[key];
    }
    var item = depRelation.find(i => i.key === key);
    
    // 引入一个模块，实际上就是执行这个模块。因此我们实际上就是根据路径找到模块，然后执行这个模块。
    var require = (path) => {
        return execute(pathTokey(path))
    }
    modules[key] = {    // modules['index.js']
        __esmodule:true
    };
    var module = {
        exports:modules[key]
    };
    item.code(require,module,module.exports);
    return module.exports
}


