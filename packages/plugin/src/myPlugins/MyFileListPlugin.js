


class MyFileListPlugin{
    constructor({filename}){
        this.filename = filename;
    }
    apply(compiler){
        compiler.hooks.emit.tapAsync("MyFileListPlugin",(compilation,callback) => {
           const assets = compilation.assets;
           let content = `## 文件名    资源大小`;
           Object.entries(assets).forEach(([filename,statObj]) => {
             content += `\n ${filename}    ${statObj.size()}`;
           })
           assets[this.filename] = {
               source:() => {
                 return content;
               },
               size(){
                 return content.length;
               }
           }
           callback();
        })
    }
}

module.exports = MyFileListPlugin;