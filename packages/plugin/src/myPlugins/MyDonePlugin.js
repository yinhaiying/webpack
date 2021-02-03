

/* 
同步插件：



*/
class MyDonePlugin{
    apply(compiler){
        compiler.hooks.done.tap("DonePlugin",(stats) => {
            console.log("done:编译完成");
        })
    }
}

module.exports = MyDonePlugin;