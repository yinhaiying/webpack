/* 
实现功能：把
< link href = "main.css" rel = "stylesheet" >
< script src = "bundle.js" > < /script>
*/



/* 
  [
  {
      tagName: 'link',
      voidTag: true,
      meta: {
          plugin: 'html-webpack-plugin'
      },
      attributes: {
          href: 'main.css',
          rel: 'stylesheet'
      }
  }
]



*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
class MyInlineSourcePlugin {
    constructor({ match}){
        this.match = match;
    }
    processTags(data,compilation){
      let headTags = [];
      let bodyTags = [];
      data.headTags.forEach((headTag) => {
          headTags.push(this.processTag(headTag, compilation))
      });
      data.bodyTags.forEach((bodyTag) => {
          bodyTags.push(this.processTag(bodyTag, compilation))
      });
      return {
          ...data,
          headTags,
          bodyTags
      }
    }
    processTag(tag,compilation){
      let newTag ,url;
      if (tag.tagName === "link" && this.match.test(tag.attributes.href)){
        newTag = {
            tagName:"style",
            attributes:{
                type:"text/css"
            }
        }
        url = tag.attributes.href;
      }
      if (tag.tagName === "script" && this.match.test(tag.attributes.src)){
        newTag = {
            tagName: "script",
            attributes: {
                type: "application/javascript"
            }
        }
        url = tag.attributes.src;
      };
      if(url){
          // 通过compilation.assets[文件地址]可以获取到每个文件的内容。
          newTag.innerHTML = compilation.assets[url].source();
          delete compilation.assets[url];  // 删除原来的资源,不让生成文件
          return newTag;
      }
      return tag;
    }
    apply(compiler) {
        // 要通过webpack-plugin来实现这个功能
        compiler.hooks.compilation.tap("MyInlineSourcePlugin", (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('MyInlineSourcePlugin', (data, callback) => {
                    data = this.processTags(data,compilation);
                    callback(null, data)
                }
            )
        })
    }
}




module.exports = MyInlineSourcePlugin;