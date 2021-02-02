/* 

SyncWaterfallHook:流水型钩子。Waterfall瀑布
瀑布的特点就是：水流一直不断，下一个接上一个。彼此之间连起来的。
因此SyncWaterfallHook的特点也是：钩子之间是有关联的，上一个钩子的返回值是下一个钩子的参数。
这样一直到最后一个钩子，所有的钩子连起来就是跟水流一样了。
*/


let {
    SyncWaterfallHook
} = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new SyncWaterfallHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tap("js", (name) => {
            console.log("js课程");
            return "js学得不错";
        });
        this.hooks.arch.tap("node", (data) => {
            console.log(data)   // 拿到上一个钩子的返回值,作为参数
            console.log("node课程");
        });
    }
    start() {
        this.hooks.arch.call();
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子