
// 接受css代码，转成js代码
const transform = (code) => {
  let result = `
    const str = ${JSON.stringify(code)};
    if(document){
      const style = document.createElement('style');
      style.innerHTML = str;
      document.head.appendChild(style);
    }
    export default str
  `;
  return result;
}

module.exports = transform;
