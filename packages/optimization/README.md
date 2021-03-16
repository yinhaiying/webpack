# webpack的优化手段


1. happypack 可以实现多线程来打包
2. tree-shaking 把没有用到的语句直接删除掉 （前提必须是通过import进行引入的，require不支持tree-shaking）
之所以不支持requrie，是因为require是可以动态引入的，无法在一开始就分析出哪些代码会被使用。
3. Scope Hoisting作用域提升
打包后每个模块都会被一个函数包裹，形成一个作用域。scope Hoisting的作用就是将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突。但是有一个前提就是，当模块的引用次数大于1时，比如被引用了两次或以上，那么这个效果会无效，也就是被引用多次的模块在被webpack处理后，会被独立的包裹函数所包裹。
* 函数声明少了很多
* 运行代码时创建函数的相应的作用域也少了
4. 抽取公共代码
optimization选项中的splitChunks，分割代码块。
```js
optimization:{
    splitChunks:{     // 分割代码块
        cacheGroups:{ // 缓存组
            common:{  // 公共的模块
              minSize:1024,   
              minChunks:2,   // 用过两次以上的抽离
              chunks:"initial"
            },
            vendor:{
                test:/node_modules/,
                priority:1,  // 权重，先抽离这些公共模块
            }
        }
    }
}
```
5. 懒加载
```js
let button = document.createElement("button");
button.innerHTML="懒加载文件";
button.addEventListener("click",function(){
    // 懒加载 草案中的语法 通过jsonp实现动态加载文件。
    import("./test.js").then((data) => {
        console.log(data)
    })
})
```
实现原理是生成的文件中，会有一个jsonp方法进行引入。需要使用`@babel/plugin-syntax-dynamic-import`插件

6. 热更新
页面有修改，不要更新整个页面，而是更新有修改的模块。
```js
new webpack.HotModuleReplacementPlugin();  //打印更新的模块
new webpack.NamedModulesPlugin()  // 热更新插件

```