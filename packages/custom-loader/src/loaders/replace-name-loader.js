

module.exports = function (source) {
    console.log("处理name的loader");
    console.log(source)
    const content = source.replace("海英", "海英斯坦");
    return this.callback(null, content)
}