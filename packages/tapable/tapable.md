
## webpack系列文章
1. [实现一个简易的模块打包器](https://juejin.cn/post/6893809205183479822#heading-14)
2. [由浅及深实现一个自定义loader](https://juejin.cn/post/6903856764018982925)
3. [webpack源码阅读一：webpack流程以及重要钩子](https://juejin.cn/post/6920495783397556237)

## 写在前面
在之前的文章中，我们进行了`webpack`的源码粗劣阅读，详见[webpack源码阅读一：webpack流程以及重要钩子](https://juejin.cn/post/6920495783397556237)。在这篇文章中，我们只是粗劣地列举出了webpack的各个阶段，以及每个阶段触发的各个钩子。我们并没有深入地去查看每个钩子，这是因为`webpack`的钩子应用了一个名叫`tapable`的库，这个库提供了钩子的各种功能，因此在深入查看`webpack`的各个钩子之前，我们必须先了解`tapable`这个库。而这会给我们阅读源码带来障碍，因为我们需要分心去学一个新的东西，这影响了我们上一篇读源码的初始目的，只是去了解webpack的各个阶段。而我们想要进一步去熟悉webpack的源码，那么就绕不开`tapable`，因此，本篇文章我将会带大家去认识`tapable`这个东西。同理，正如我在之前的文章中所说，掌握一个东西，最好的办法就是去实现一个简易的它，因此本文我们会实现一个简易的`tapable`库，将webpack中使用到的`tapable`核心类都实现一遍。我始终认为只有自己动手做过的东西才会印象最深刻。



## tapable是什么？
看过`webpack`源码的同学可能都会发现，在源码中突然会出现一些`compiler.hooks.done.tap(xxx,callback)`这种代码，也就是突然触发一个钩子，我们也不知道这个钩子在哪里定义的。实际上这就是类似于我们常说的发布订阅模式，都是注册一个事件，然后到了适当的时候。以我们最常见的node.js的Event机制为例。通过`on`方法注册一个事件，然后通过`emit`方法进行触发。
```js
const EventEmitter = require("event");
const myEmitter = new EventEmitter();

myEmitter.on("js",(..args) => {
    console.log(...args);
})
myEmitter.emit("js","前端课程");
```
tapable的机制与Event类似，它可以用来定义各种各样的钩子，相当于Event中的事件注册，但是与Event不同的是Event中各个事件之间相互不关联，互不影响，但是tapable注册的事件之间可以是有关系的，这种关系通过`tapable`定义的各个钩子类来实现。其实，`tapable`的核心就是这些钩子类。因此，我们接下来的重点就是讲述这些钩子类，并实现它们。


## tapable的各个钩子
![tapable的各个钩子](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c7489623d754584a7a03a26fe11defb~tplv-k3u1fbpfcp-watermark.image)
如上图所示，列举出了tapable的所有的钩子。
根据同步和异步分为：<br/>
1. Sync*：同步钩子。所有钩子同步执行。
2. Async*：异步钩子。钩子异步执行。

每种钩子根据与其他钩子之间的关系，又可以分为：
1. **普通型钩子Hook**：就是各个钩子之间没有关联，大家按照注册顺序依次执行，互不影响。
2. **熔断型钩子BallHook**：就是如果上一个钩子返回出undefined以外的值，后面的钩子就都不执行了。
3. **流水型钩子WaterHook**：上一个钩子的返回值，作为下一个钩子的参数传递进去。
好了，到目前为止我们已经介绍了tapable中钩子的分类，可能大家不是很能够理解，接下来我会一个一个地带大家认识每一个钩子，并实现一遍。

## Sync* 同步类型的钩子


### SyncHook 普通型同步钩子

**1、定义：**
SyncHook是普通型同步钩子。各个钩子按照顺序依次执行，互不影响。

**2、使用：**

```js
let {SyncHook} = require("tapable");
console.log(new SyncHook(["name"]);   // SyncHook类实例身上都有什么。
```

我们在之前介绍过tapable的每个子类都是一个用于注册和触发事件的钩子，我们可以查看一下SyncHook实例身上有哪些属性，找到它注册事件和触发事件的属性。

```js
SyncHook {
  _args: [],
  name: undefined,
  taps: [],
  interceptors: [],
  _call: [Function: CALL_DELEGATE],
  call: [Function: CALL_DELEGATE],   // 看这里，看这里。用于触发同步事件的钩子
  _callAsync: [Function: CALL_ASYNC_DELEGATE],
  callAsync: [Function: CALL_ASYNC_DELEGATE],
  _promise: [Function: PROMISE_DELEGATE],
  promise: [Function: PROMISE_DELEGATE],
  _x: undefined,
  compile: [Function: COMPILE],
  tap: [Function: tap],        // 看这里，看这里。用于注册同步事件的钩子
  tapAsync: [Function: TAP_ASYNC],
  tapPromise: [Function: TAP_PROMISE],
  constructor: [Function: SyncHook] 
}
```

通过上面的属性，我们可以知道`SyncHook`通过`tap`注册事件，通过`call`触发事件。接下来我们就使用`SyncHook`来定义一个钩子，并触发它。

```js
let {SyncHook} = require("tapable");
class Lesson{
    constructor(){
        this.hooks = {
            arch:new SyncHook(["name"]),   // SyncHook的实例
        }
    }
    tap(){
        this.hooks.arch.tap("js",(name) => {   // 注册js事件
          console.log(`${name}注册了js事件`);
        });
        this.hooks.arch.tap("css",(name) => {  // 注册css事件
          console.log(`${name}注册了css事件`);
        });
    }
    start(){
      this.hooks.arch.call("haiyinsitan");     // 触发，执行所有的事件。
    }
}
let lesson = new Lesson();
lesson.tap();   // 注册这两个事件

lesson.start(); // 启动钩子
```

从上面的代码中，我们可以看到。通过`this.hooks.arch.tap(xxx,fn)`用于注册一个事件，其中`this.hooks.arch`是`SyncHook`的实例。通过`this.hooks.arch.call`触发所有的事件。最终的输出结果是：

```js
haiyinsitan注册了js事件
haiyinsitan注册了css事件
```

我们总结一下`SyncHook`的特点：

1. 同步钩子各个事件同时执行
2. 各个事件之间互不影响，不存在参数传递，和阻碍执行的情况
3. call触发时执行所有的事件，传递的参数，传递给了每个事件。

基于以上的特点，我们实现一个自定义的SyncHook。

### 自定义的SyncHook

```js
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
```

我们可以看下，实现思路其实非常简单，只需要定义一个队列，每次通过tap注册事件时，将执行的函数放入进去。当通过call进行调用时，一次性执行队列中所有的函数即可。在代码中使用进行查看：

```js
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
```

最终的效果与原来的SyncHook一致。当然，这种实现只是简单的功能上的一致。



### SyncBailHook熔断型同步钩子

**1、定义：<br>**
Sync：同步。Bail：保险。SyncBailHook表示出于安全考虑，直接熔断了，炒过股票的同学可能都知道股市存在熔断，也就是下跌超过某个值，比如10%就直接熔断，所有股票禁止交易。在这里也是一样，熔断型的钩子，**如果返回非undefined的值到这里执行完毕就直接熔断了**。

**2、使用：**<br>

```js

let { SyncBailHook} = require("tapable");
class Lesson {
    constructor() {
        this.hooks = {
            arch: new SyncBailHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tap("js", (name) => {
            console.log(`${name}在学习js课程`);  // 没有返回值，默认返回undefined
        });
        this.hooks.arch.tap("css", (name) => {
            console.log(`${name}在学习css课程`);
            return "非undefined就停止后面的钩子运行";            // 返回非undefined的值，下面的钩子就都不执行了。
        });
        this.hooks.arch.tap("html", (name) => {
            console.log(`${name}在学习html课程`);
        });
    }
    start() {
        this.hooks.arch.call("haiyinsitan");
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
```

我们可以看下，第一个钩子注册的`js`事件，调用的函数没有返回值，默认返回undefined，第二个钩子注册的`css`事件，返回一个非undefined的字符串。第三个钩子注册了`html`事件。

我们看下最终的输出结果:

```js
haiyinsitan在学习js课程
haiyinsitan在学习css课程
```

我们可以发现，只执行了两个事件的执行函数，最后一个事件`html`由于上一个`css`事件返回了非undefiend的值，因此直接熔断了，后面的钩子都不执行了。这就是SyncBailHook的特点。

### 自定义的SyncBailHook

我们可以发现SyncBailHook和SyncHook的最重要的区别就是，如果上一个钩子的返回值是非undefined，那么后面的钩子都无法执行。因此，我们只需要对每个钩子执行后的返回值进行判断，如果它不等于undefined，只需要阻止后面的钩子执行即可。

```js
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
          if(result !== undefined){   // 看这里，看这里。如果上一个钩子的返回值不等于undefined
              break;                  // 终止循环，不让后面的钩子执行。
          }
        }
    }
}
```

### SyncWaterfallHook流水型同步钩子

**1、定义：**<br>

SyncWaterfallHook流水型同步钩子：上一个钩子的执行结果，作为下一个钩子的参数进行传递。

**2、使用**：<br>

```js
let { SyncWaterfallHook } = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new SyncWaterfallHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tap("js", (name) => {
            console.log("js课程");
            return "js课程";
        });
        this.hooks.arch.tap("node", (data) => {
            console.log(`上一个钩子返回：${data}`);   // 拿到上一个钩子的返回值,作为参数
            console.log("node课程");
        });
    }
    start() {
        this.hooks.arch.call();
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件
lesson.start(); // 启动钩子
```

我们可以看下，最终的输出值：

```js
js课程
上一个钩子返回：js课程
node课程
```

其中`node`钩子的参数是上一个钩子`js`的返回值。这也是SyncWaterfallHook的最大特点。

### 自定义SyncWaterfallHook

SyncWaterfallHook钩子的最大特点就是：需要拿到上一个钩子的返回值，作为下一个钩子的参数。其中第一个钩子的参数是call时传入的值。其他钩子都是上一个钩子的返回值。因此我们只需要对参数做一下特殊处理即可。

```js
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
                result = this.tasks[i](...args);  // 第一个钩子参数是传入的值
            }else{
                result = this.tasks[i](result);   // 其他钩子参数是上一个钩子的返回值
            }
        }
    }
}
```

## Async*异步类型的钩子

tapable可以注册各种各样的事件，但是这些事件的执行函数不可能都是同步的，有时候我们不可避免地需要使用到异步。而异步函数我们不知道它什么时候能够执行完毕，因此需要一个callback参数来标识异步函数执行完毕。同理钩子的触发也不知道所有的异步函数什么时候能够执行完毕，因此也需要通过callback来标识所有异步钩子执行完毕。



### AsyncParallelHook异步并行钩子

**1、定义：<br>**
AsyncParallelHook：异步并行钩子。

异步：钩子注册的事件的回调函数是一个异步的函数。

并行执行：所有的钩子虽然都是异步的但是同时执行，不分先后。

**2、使用：**<br>

```js
let { AsyncParallelHook} = require("tapable");
class Lesson {
    constructor() {
        this.hooks = {
            arch: new AsyncParallelHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (name,callback) => {  // 使用tapAsync来注册事件
            setTimeout(() => {
                console.log("js课程");
                callback();
            },1000)
        });
        this.hooks.arch.tapAsync("css", (name,callback) => {
            setTimeout(() => {
                console.log("css课程");
                callback();
            },1000)
        });
    }
    start() {
        this.hooks.arch.callAsync("haiyinsitan",() => {    // 使用callAsync来触发钩子
            console.log("异步钩子在所有异步hooks执行完毕之后，必须有回调")
        });
    }
}
let lesson = new Lesson();
lesson.tap(); // 注册这两个事件

lesson.start(); // 启动钩子
```

在上面的代码中我们可以看到异步钩子和同步钩子的区别：

1. 异步钩子使用tapAsync来注册事件，使用callAsync来触发事件

2. 异步钩子注册的执行函数最后一个参数是callback，这个callback用来标识异步函数执行完毕

   ```js
           this.hooks.arch.tapAsync("css", (name,callback) => {
               setTimeout(() => {
                   console.log("css课程");
                   callback();  // callback必须执行
               },1000)
           });
   ```

3. callAsync的执行函数的最后一个参数是一个回调函数，在所有异步钩子执行完毕之后执行。

我们可以看下最终的输出结果：

```js
js课程    // 并行执行，1000s后执行
css课程   // 并行执行，1000s后执行
异步钩子在所有异步hooks执行完毕之后，必须有回调  // 所有异步函数执行完毕之后执行
```



### 自定义AsyncParallelHook

AsyncParallelHook的特点：

1. 异步执行，需要有callback参数
2. 并行执行，所有钩子对应的函数同时执行
3. callAsync的最后一个参数是在所有异步钩子执行完毕之后执行

```js
class MyAsyncParallelHook {
    constructor(args) {
        this.tasks = [];
    }
    tapAsync(eventName, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let finalCallback = args.pop();   //最后一个参数是回调函数。
        let index = 0;   // index用来标识有多少异步钩子执行了。
        const done = () => {   // done就是每个异步函数的callback
          index += 1;
          if (index === this.tasks.length) {
              finalCallback();   // 所有异步钩子执行完毕之后执行
          }
        }
        this.tasks.forEach((task) => {
            task(...args,done);
        });
    }
}
```



### AsyncSeriesHook异步串行钩子

**1、定义：<br>**
AsyncSeriesHook：异步串行钩子。

异步：钩子注册的事件的回调函数是一个异步的函数。

串行执行：钩子按照注册的顺序依次执行。

**2、使用：**<br>

```js
let { AsyncSeriesHook} = require("tapable");

class Lesson {
    constructor() {
        this.hooks = {
            arch: new AsyncSeriesHook(["name"]),
        }
    }
    tap() {
        this.hooks.arch.tapAsync("js", (name, callback) => {
            setTimeout(() => {
                console.log("5000ms后执行js课程");
                callback();
            }, 5000)
        });
        this.hooks.arch.tapAsync("css", (name, callback) => {
            setTimeout(() => {
                console.log("1000ms后执行css课程");
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
```

我们可以发现：注册的js事件的执行函数，需要再5000ms之后执行，而注册的`css`事件只在1000ms之后执行。然后查看一下输出结果：

```js
5000ms后执行js课程
1000ms后执行css课程
异步钩子在所有异步hooks执行完毕之后，必须有回调
```

发现，先注册的js事件，虽然执行时间长，但是还是先执行了，也就是说AsyncSeriesHook是按照注册的先后顺序串行执行的。

### 自定义AsyncSeriesHook

AsyncSeriesHook的特点：

1. 异步执行
2. 串行执行。按照注册的顺序依次执行

所有的异步串行执行(有先后顺序的)的函数，都需要一个中间函数`next`。next会作为每个函数的最后一个参数传递进去，然后执行。

```js
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
```

### AsyncSeriesWaterfallHook异步串行流水型钩子

**1、定义：<br>**
AsyncSeriesWaterfallHook：异步串行钩子。

异步：钩子注册的事件的回调函数是一个异步的函数。

串行执行：钩子按照注册的顺序依次执行。

流水型：上一个钩子的返回值作为下一个钩子的参数。

**2、使用**<br>

```js
let { AsyncSeriesWaterfallHook} = require("tapable");

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
                callback("error","css课程");   // 看这里，看这里。
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
```

注意：异步流水型的钩子，通过callback进行参数传递，这里我们需要注意一下callback的参数：

1. callback的第一个参数用来标识错误。如果为null标识没有错误，为其他值表示有错误，当有错误时，直接熔断，后面的钩子不执行。
2. callback的除了第一个参数以外的参数用于传递值。

我们可以看下上面代码的最终的输出结果：

```js
js课程
上一个钩子的返回结果： js课程
css课程
异步钩子在所有异步hooks执行完毕之后，必须有回调
```

可以发现：css钩子顺利拿到了上一个钩子的返回值，但是node钩子由于css钩子callback的第一个参数为非null的值，因此直接熔断，之后的所有钩子都不执行了。

### 自定义AsyncSeriesWaterfallHook

AsyncSeriesHook的特点：

1. 异步执行
2. 串行执行。按照注册的顺序依次执行
3. 流水型：上一个钩子的返回值作为下一个钩子的参数

```js
class MyAsyncSeriesWaterfallHook {
    constructor(args) {
        this.tasks = [];
    }
    tapAsync(eventName, task) {
        this.tasks.push(task)
    }
    callAsync(...args) {
        let index = 0;
        let finalCallback = args.pop();
        let next = (error,data) => {
          let task = this.tasks[index];
          if(!task){
            return finalCallback();
          }
          if(index === 0){
              task(...args,next);
          }else{
              task(data,next);
          }
          index += 1;
        }
        next();
    }
}
```

注意：上面的代码中没有对错误的处理。只是实现了AsyncSeriesWaterfallHook的上述的三个特点。


## 总结
到目前为止，本篇文章主要介绍了：
1. tapable是什么？
2. tapable的各个钩子以及他们的分类和特点
3. 详细介绍了每种钩子的使用，并实现了它的主要功能

文中并没有介绍和实现所有的钩子，因为有些钩子在webpack中的使用次数为0。我们并不需要去关心它，而且通过它们的名字基本上就能够知道他们的用途了。掌握了这些钩子，我们再去看webpack的源码就能够事半功倍。


## 参考文献
[webpack/tapable](https://github.com/webpack/tapable)
[显微镜下的webpack4：灵魂tapable，终于搞懂钩子系列](https://juejin.cn/post/6844903711991398414)