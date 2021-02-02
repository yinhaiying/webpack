/* 

SyncBailHook:熔断型钩子。如果返回了除undefined以外的值，那么它后面的钩子就不执行了。
Bail:保险，出于安全保险的考虑，你就不要往下执行了。

*/


let {
    SyncBailHook
} = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new SyncBailHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tap("js", (name) => {
            console.log("js课程");
            return "非undefined就停止后面的钩子运行";            // 返回非undefined的值，下面的钩子就都不执行了。
        });
        this.hooks.arch.tap("css", (name) => {
            console.log("css课程");
        });
    }
    start() {
        this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子