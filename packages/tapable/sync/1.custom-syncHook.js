class MySyncHook{
    constructor(args){
      this.tasks = [];
    }
    tap(eventName,task){
      this.tasks.push(task)
    }
    call(...args){
      this.tasks.forEach((task) => {
          task(...args)
      })
    }
}


class Lesson {
    constructor() {
        this.hooks = {
            arch: new MySyncHook(["name"]),
        }
    }
    tap() {
        console.log(Object.keys(this.hooks.arch));
        this.hooks.arch.tap("js", (name) => {
            console.log(name);
        });
        this.hooks.arch.tap("css", (name) => {
            console.log(name);
        });
    }
    start() {
        this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
