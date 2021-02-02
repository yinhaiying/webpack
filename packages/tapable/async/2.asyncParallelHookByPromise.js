/* 

基于promise的异步注册：
tapable中有三种注册的方法：
tap :同步注册
tapAsync:异步注册
tapPromsie:promise类型的异步注册
tapable中有三种触发的方法：
call:同步触发
callAsync:异步触发
promise:promise类型的异步触发



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
        this.hooks.arch.tapPromise("js", (name) => {
            return new Promise((resolve,reject) => {
                setTimeout(() => {
                    console.log("js课程");
                    resolve();
                }, 1000)
            })
        });
        this.hooks.arch.tapPromise("css", (name) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log("css课程");
                    resolve();
                }, 1000)
            })
        });
    }
    start() {
        this.hooks.arch.promise("haiyingsitan").then(() => {
            console.log("end:所有异步hooks执行完毕")
        })
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
