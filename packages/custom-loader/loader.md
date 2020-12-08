## 深入理解webpack的loader


## 前沿



## 参考文献：
[自定义loader](https://juejin.cn/post/6882895689773383694#heading-0)
[how to write a loader](https://webpack.js.org/contribute/writing-a-loader/)
## loader的配置：
如果不需要传递参数(也就是配置信息)
```javascript
     {
        test: /\.js$/,
        use: "./src/loaders/replace-loader.js",
    },

```
如果需要传递参数：
```javascript
    {
        test:/\.js$/,
        use:{
            loader:"replaceLoader",
            options:{
                params:"哈哈，这是一个替换loader"
            }
        }
    }


```
## loader如何接收参数：
如果我们想要给loader传递参数，我们在配置信息里给出参数
```javascript
    {
        test:/\.js$/,
        use:{
            loader:"replaceLoader",
            options:{
                params:"哈哈，这是一个替换loader"
            }
        }
    }
```
但是loader函数如何接收了，我们知道Loader接收一个参数，是读取的文件内容，那新增的这些参数是写在第一个参数后面吗？
```javascript
module.exports = function(source,...rest)  {
    console.log("source:");
    console.log(source);
    console.log("rest:",rest);   /// undefined 
    const content = source.replace("海英","海英斯坦").replace("18","28");
    return content;
}
```
我们发现最终获取到的参数是空的，也就是说webpack不是把配置信息当作参数放到loader中。
事实上，webpack是通过把参数放到this中(因此，loade最好不要使用箭头函数)，通过this.query来进行获取。
```javascript

module.exports = function(source)  {
    console.log("query:", this.query); // { params: '哈哈哈哈，这是一个用于替换的loader' }
    const content = source.replace("海英","海英斯坦").replace("18","28");
    return content;
}
```
但是，webpack更加推荐使用loader-utils模块来获取,它提供了许多有用的工具，最常用的一种工具是获取传递给loader的选项。


## this.callback()
在一些情况下，我们返回的是原来内容转换后的内容，但是我们可能还需要返回其他的东西，比如我们可能还想要生成sourceMap文件，
这时候不能直接返回这两个东西，而是需要使用webpack提供的this.callback方法，
```javascript
module.exports = function(source)  {
    console.log("params",getOptions(this).params)
    const content = source.replace("海英","海英斯坦").replace("18","28");
    this.callback(null,content,sourceMap)
}
```
事实上我们都可以不通过return，而是所有的返回都通过this.callback来实现
```name
module.exports = function(source)  {
    console.log("params",getOptions(this).params)
    const content = source.replace("海英","海英斯坦").replace("18","28");
    this.callback(null,content)
}
```

## webpack中resolveLoader的使用方法
