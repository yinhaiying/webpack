## plugin

我们可以看下`webpack`中源码的实现：
```js
if (Array.isArray(plugins)) {
    for (const plugin of plugins) {
        plugin.apply(childCompiler);   // 调用apply方法
    }
}
```
如果plugins是一个数组(这就是为什么我们在`webpack.config.js`中需要定义plugins成一个数组),然后会遍历这个数组，对数组的每个元素，也就是每个插件，调用它的apply方法并传入compiler对象。这就是为什么所有编写的插件都必须有一个apply方法。
