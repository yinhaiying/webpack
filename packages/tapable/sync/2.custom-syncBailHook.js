class MySyncBailHook {
    constructor(args) {
        this.tasks = [];
    }
    tap(eventName, task) {
        this.tasks.push(task)
    }
    call(...args) {
        for(let i = 0;i < this.tasks.length;i++){
          let result = this.tasks[i](...args);
          if(result !== undefined){
              break;
          }
        }
    }
}


class Lesson {
    constructor() {
        this.hooks = {
            arch: new MySyncBailHook(["name"]),
        }
    }
    tap() {
        console.log(Object.keys(this.hooks.arch));
        this.hooks.arch.tap("js", (name) => {
            console.log(`${name}在学习js`);
        });
        this.hooks.arch.tap("css", (name) => {
             console.log(`${name}在学习css`);
             return ""
        });
        this.hooks.arch.tap("html", (name) => {
             console.log(`${name}在学习css`);
        });
    }
    start() {
        this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
