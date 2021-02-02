class MyAsyncParallerHook {
    constructor(args) {
        this.tasks = [];
    }
    tapAsync(eventName, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop();   //最后一个参数是回调函数。
        let index = 0;
        const done = () => {
          index += 1;
          if (index === this.tasks.length) {
              finalCallback();
          }
        }
        this.tasks.forEach((task) => {
            task(...args,done);
        });
    }
}

class Lesson {
    constructor() {
        this.hooks = {
            arch: new MyAsyncParallerHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (name, callback) => {
            setTimeout(() => {
                console.log("js课程");
                callback();
            }, 1000)
        });
        this.hooks.arch.tapAsync("css", (name, callback) => {
            setTimeout(() => {
                console.log("css课程");
                callback();
            }, 1000)
        });
    }
    start() {
        this.hooks.arch.callAsync("haiyinsitan", () => {
            console.log("end:所有异步hooks执行完毕")
        });
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
