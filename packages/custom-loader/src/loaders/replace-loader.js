
const {getOptions}  = require("loader-utils");

module.exports = function(source)  {
    const content = source.replace("海英","海英斯坦").replace("18","28");
    // return content;
    return this.callback(null,content)
}