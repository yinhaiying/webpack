const MyDonePlugin = require("./MyDonePlugin");



class MyAsyncPlugin{
    apply(compiler){
        compiler.hooks.emit.tapAsync("MyAsyncPlugin",(compilation,callback) => {
          setTimeout(() => {
            console.log("文件发射之后,等一下");
            callback();
          },2000)
        })
    }
}

module.exports = MyAsyncPlugin;