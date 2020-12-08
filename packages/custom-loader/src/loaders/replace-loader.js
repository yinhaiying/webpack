const {
    getOptions
} = require('loader-utils');
const { SourceMap } = require('module');
module.exports =  function(source,...rest)  {
    // console.log("query:",this.query);  // {name:"刘亦菲",age:22}
    // let {name ,age} = this.query;
    // console.log("callback",this.callback);
    // console.log("async",this.async);
    let {name,age} = getOptions(this);
    const content =  source.replace("小明",name).replace("18",age);
    // return content;
    // this.callback(null,content,SourceMap)
    this.async()(null, content, SourceMap)
}