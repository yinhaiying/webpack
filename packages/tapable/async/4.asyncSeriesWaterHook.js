/* 
AsyncSeriesWaterfallHook:异步串行。
async:异步。
series：序列。
AsyncSeriesWaterfallHook: 异步串行流水型钩子
*/

let {
    AsyncSeriesWaterfallHook
} = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new AsyncSeriesWaterfallHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (data, callback) => {
            setTimeout(() => {
                console.log("js课程");
                // callback("error","js课程");   // 第一个值是error，如果为null那么会继续往下执行。
                callback(null,"js课程");
            }, 2000)
        });
        this.hooks.arch.tapAsync("css", (data, callback) => {
            setTimeout(() => {
                console.log("上一个钩子的返回结果：",data)
                console.log("css课程");
                callback(null,"css课程");
            }, 1000)
        });
        this.hooks.arch.tapAsync("node", (data, callback) => {
            setTimeout(() => {
                console.log("上一个钩子的返回结果：",data)
                console.log("node课程");
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