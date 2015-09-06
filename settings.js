module.exports = {
    port: 8081,
    dir: 'd:/nginx/html/xg/uploads/',                       //图片存储目录
    tmpdir: 'd:/nginx/html/xg/uploads/tmp/',                       //临时目录
    url: 'http://static.hpbanking.com/xg/uploads/',          //图片访问地址
    filesize: 10240000,                           
    imgsize: 3072000,
    suffix: '\.(jpg|png|gif|zip|rar)$'
};