/* 
AsyncSeriesHook:异步串行。
async:异步。
series：序列。
asyncSeriesHook:异步地按照顺序依次执行，因此是异步串行钩子。
*/
let {
    AsyncSeriesHook
} = require("tapable");

class MyAsyncSeriesHook {
    constructor(args) {
        this.tasks = [];
    }
    tapAsync(eventName, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop();
        let index = 0;
        let next = () => {
          if(this.tasks.length === index){
            finalCallback();
            return;
          }
          let task = this.tasks[index++];
          task(...args,next);
        }
        next();
    }
}


class Lesson {
    constructor() {
        this.hooks = {
            arch: new MyAsyncSeriesHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (name, callback) => {
            setTimeout(() => {
                console.log("js课程");
                callback();
            }, 2000)
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
            console.log("异步钩子在所有异步hooks执行完毕之后，必须有回调")
        });
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件
lesson.start(); // 启动钩子