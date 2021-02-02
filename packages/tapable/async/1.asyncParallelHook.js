/* 
AsyncParallelHook:并行的异步钩子：
注册方法分为：tap注册和tapAsync异步注册
tap注册：
tapAsync注册：除了普通传的参数之外，还有一个callback回调残水。执行这个回调相当于告诉别人，我执行完了。不然异步函数谁也不知道你什么时候执行完毕。


callAsync:异步触发：
只要其中一个注册函数的回调没有执行， 说明它还没有执行完毕。 那么callAsync的回调函数就永远不会执行。
大致思路是：定义一个计数器，只有计数器的值等于执行了回调的函数的值。表示所有事件执行完毕，可以执行callAsync的回调了。

*/

let {
    AsyncParallelHook
} = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new AsyncParallelHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (name,callback) => {
            setTimeout(() => {
                console.log("js课程");
                callback();
            },1000)
        });
        this.hooks.arch.tapAsync("css", (name,callback) => {
            setTimeout(() => {
                console.log("css课程");
                // callback();
            },1000)
        });
    }
    start() {
        this.hooks.arch.callAsync("haiyinsitan",() => {
            console.log("异步钩子在所有异步hooks执行完毕之后，必须有回调")
        });
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子