var express = require('express');                                                                                                                                                                                                                                           
var router = express.Router();
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var fse = require('fs-extra');
var images = require('images');
var settings = require("../settings");
var crypto = require('crypto');
var utils = require('utility');
var FlexCombo = require("flex-combo");

// function md5 (text) {
//   return crypto.createHash('md5').update(text).digest('hex');
// };
function sendMsg(res, data){ 
    var str = JSON.stringify(data);//jsonp  
        res.send(200, str);
}
function is_filetype(filename, types) { 
	types = types.split(','); 
	var pattern = '\.('; 
	for(var i=0; i<types.length; i++) { 
	if(0 != i) { 
	pattern += '|'; 
	} 
	pattern += types[i].trim(); 
	} 
	pattern += ')$'; 
	return new RegExp(pattern, 'i').test(filename); 
}; 
function removeFile(tmpname){ 
    fse.remove(tmpname, function (err) {
      if (err) return console.error(err)
      console.log('remove tmpfile success!')
    })
}
var instance = FlexCombo(settings, ".flex-combo");
router.get('/xg', function(req, res, next) {
    instance(req, res, function() {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Your combo file not found.");
    });
})

/* 上传图片页面 */
router.get('/upload', function(req, res, next) {
   res.render('index', { title: 'Express' });
 });
  
/* 图片上传接口*/
router.post('/file/uploading', function(req, res, next){
  var tmppath = settings.tmpdir,
      truepath = settings.dir,
      url = settings.url,
      maxfilesize = settings.filesize,
      maximgsize = settings.imgsize,
      supportfile = settings.suffix,
      filesize = req.headers['content-length'];
  //生成multiparty对象，并配置下载目标路径
  var form = new multiparty.Form({uploadDir: tmppath});

  //下载后处理
  form.parse(req, function(err, fields, files) {
    var filesTmp = JSON.stringify(files,null,2),
        type = fields.type || "files",                                  //项目目录 credit || police
        source = fields.source || "",                                   //图片来源: 图片转发或本项目上传（本项目上传需重命名）
        inputFile = files.file[0],                                      //已上传文件信息
        uploadedpath = inputFile.path,                                  //已上传文件路径
        suffix = /\.[^\.]+/.exec(inputFile.originalFilename);           //文件后缀名
    if(err){
      console.log('parse error: ' + err);
      var data = { 
          code : 103,
          msg : "上传失败，请稍后再试"
      }
      var str = JSON.stringify(data);//jsonp  
          res.send(200, str);
    } else {
    	console.log('parse files: ' + filesTmp);
    	var isImg = is_filetype(suffix, 'png,gif,jpg'),
    		isZip = is_filetype(suffix, 'zip,rar');
    	if(isImg){
    		var img = images(uploadedpath);
    	}

		
      if(source=="self"){
	      var newname = utils.md5(inputFile);//随机新文件名
	      if(isImg){
	      	newname = newname + "-" +img.width() + '-' + img.height() + suffix;
	      }else if(isZip){ 
	      	newname = newname + suffix;
	      }
      }else{ 
          var newname = inputFile.originalFilename;
      }

      switch(type){ 
        case 'credit':
          truepath = settings.dir + 'credit/';
          url = settings.url + 'credit/';
          break;
        case 'police':
          truepath = settings.dir + 'police/';
          url = settings.url + 'police/';
          break;
        default:
          truepath = settings.dir + type + '/';
          url = settings.url + type + '/';
          break;
      }
      var rename = truepath + newname,      //真实文件路径
          tmpname = tmppath + newname,      //临时文件路径
          urlpath = url + newname;          //文件访问地址

     //重命名为随机名
	  
      fs.rename(uploadedpath, tmpname, function(err) {
        if(err){
          console.log('rename error: ' + err);
        } else {
          console.log('rename ok');
	      //如果符合大小限制及文件类型判断，则将文件从临时目录拷贝到对应目录
	      if(supportfile.match(suffix)){
	        if(filesize<=maxfilesize){ 
				fse.copy(tmpname, rename, function (err) {
					if (err) { 
                        var data = { 
                              code : 104,
                              msg : err
                          }
                        removeFile(tmpname)
                        sendMsg(res, data);
                        //return console.error(err)
                    }else{ 
                        console.log("copy success!")
                        var data = { 
                          code : 0,
                          msg : "上传成功",
                          url: urlpath
                        }
                        removeFile(tmpname)
                        sendMsg(res, data);
                    }
                    
                    
				})
	        }else{ 
	          var data = { 
	              code : 101,
	              msg : "请将上传文件控制在10m以内"
	          }
              removeFile(tmpname)
              sendMsg(res, data);
	        }
	      }else{ 
	        var data = { 
	            code : 102,
	            msg : "请上传符合规定类型的文件"
	        }
            removeFile(tmpname)
            sendMsg(res, data);
	      }

	      
	      }
      });


	}
    
  });
});

module.exports = router;