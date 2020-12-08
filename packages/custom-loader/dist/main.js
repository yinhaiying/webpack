(() => {
    var t = {
            600: t => {
                t.exports = "hello,this is a txt document"
            }
        },
        o = {};

    function r(e) {
        if (o[e]) return o[e].exports;
        var s = o[e] = {
            exports: {}
        };
        return t[e](s, s.exports, r), s.exports
    }(() => {
        const t = r(600);
        console.log("txt:", t)
    })()
})();