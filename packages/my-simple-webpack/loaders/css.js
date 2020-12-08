const processCss = function (fileContent) {
    return `
      const str = ${JSON.stringify(fileContent)};
      if (document) {
        const style = document.createElement('style');
        style.innerHTML = str;
        document.head.appendChild(style);
      }
      module.exports= str;
    `
}
module.exports = processCss;