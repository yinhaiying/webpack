class MySyncWaterfallHook {
    constructor(args) {
        this.tasks = [];
    }
    tap(eventName, task) {
        this.tasks.push(task)
    }
    call(...args) {
        let result = null;
        for (let i = 0; i < this.tasks.length; i++) {
            if(i === 0){
                result = this.tasks[i](...args);
            }else{
                result = this.tasks[i](result)
            }
        }
    }
}


class Lesson {
    constructor() {
        this.hooks = {
            arch: new MySyncWaterfallHook(["name"]),
        }
    }
    tap() {
        console.log(Object.keys(this.hooks.arch));
        this.hooks.arch.tap("js", (name) => {
            console.log(`${name}在学习js`);
            return "js";
        });
        this.hooks.arch.tap("node", (params) => {
            console.log(params);
            console.log(`他已经学习完${params}，正在学习node`);
            return "js和node";
        });
        this.hooks.arch.tap("vue", (params) => {
            console.log(params);
            console.log(`他已经学习完${params},正在学习vue`);
        });
    }
    start() {
        this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
