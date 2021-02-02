let {SyncHook} = require("tapable");
class Lesson{
    constructor(){
        this.hooks = {
            arch:new SyncHook(["name"]),
        }
    }
    tap(){
        this.hooks.arch.tap("js",(name) => {
          console.log(`${name}注册了js事件`);
        });
        this.hooks.arch.tap("css",(name) => {
          console.log(`${name}注册了css事件`);
        });
    }
    start(){
      this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap();   // 注册这两个事件

lesson.start(); // 启动钩子