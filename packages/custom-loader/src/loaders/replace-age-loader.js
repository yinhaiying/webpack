
module.exports = function (source) {
    console.log("处理age的loader");
    console.log(source);
    const content = source.replace("18", "28");
    return this.callback(null, content)
}