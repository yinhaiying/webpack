let {SyncHook} = require("tapable");

class Lesson{
    constructor(){
        this.hooks = {
            arch:new SyncHook(["name"]),
        }
    }
    tap(){
        console.log(Object.keys(this.hooks.arch));
        this.hooks.arch.tap("js",(name) => {
          console.log("js课程");
        });
        this.hooks.arch.tap("css",(name) => {
          console.log("css课程");
        });
    }
    start(){
      this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap();   // 注册这两个事件

lesson.start(); // 启动钩子