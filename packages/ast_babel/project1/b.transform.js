// 这个文件是用来分析转义后的b.js
"use strict";
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports["default"] = void 0;
    var _a = _interopRequireDefault(require("./a.js"));
    function _interopRequireDefault(obj) { 
        return obj && obj.__esModule ? obj : { "default": obj }; 
    }
    var b = {
        value: "b",
        getA: function getA() {   
            return _a["default"].value + "from b.js"; 
        }
    };

    var _default = b;
    exports["default"] = _default;


    /* 
    分析一：
       Object.defineProperty(exports, "__esModule", {
           value: true
       });
       等价于：
       exports["__esModule"] = true;
    为什么要使用Object.defineProperty这种写法了？
    给当前模块添加__esModule:true属性，方便跟CommonJs区分开来。(如果你想知道一个模块是使用CommonJs还是ESModule ,查看是否有__esModule:true属性。有的话就是ESModule)
    
    分析二：
     exports["default"] = void 0;
     void 0等价于undefined。
     这句话是为了强制清空exports["default"]的值
    
     分析三：
     import a from "./a.js"变成
     var _a = _interopRequireDefault(require("./a.js"));
     _interopRequireDefault函数：
     1、_下划线前缀是为了避免与其他变量重名
     2、该函数的功能是给模块（requrie出来的东西）添加default属性
     3、为什么要加default:CommonJs模块没有默认导出，加上方便兼容
     4、内部实现：return obj && obj.__esModule ? obj : { "default": obj };
     5、 以前取a模块的值， 是a.value。 现在变成了a["default"].value
     6、 _interop开头的函数大都是为了兼容旧代码 
    

     分析四：
     export default b;变成了
     var _default = b;
     exports["default"] = _default;
     为什么要写成两句话了。 实际上就是exports["default"] = b;
    */

    /* 
    import 关键字变成了 require函数
    export 关键字变成了exports对象
    本质上就是把ESModule语法变成了CommonJs规则
    但是目前我们不知道require函数怎么实现？
    */