'use strict'

var express = require("express");
var morgan = require('morgan');//打印访问日志到本地文件
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var operation = require("./src/index.js");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 

//打印日志文件到accsee.log
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogStream}));

//允许跨域,响应OPTION请求
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method == 'OPTIONS') {
        console.log("OPTIONS")
        res.send(200); /*让options请求快速返回*/
    }
    else {
        next();
    }
});

//接受请求
app.post('/mapRectangle',function(req,res){
    // console.log(req.body);
    function* genF (params) {
        var result = yield operation.mapRectangle(req.body);
        var data = yield  {
            code: 0,
            msg: "success",
            data: result
        };
        return res.send(data)
    }
    var run = genF(req.body);
    var result = run.next();
    var data = run.next(result.value);
    run.next(data.value);
});

//捕捉系统异常，防止错误引发宕机
/*process.on('uncaughtException', function(e) {
　　console.log('uncaughtException'+e);
});*/
//错误处理
app.use(function(err, req, res, next) {  
    console.error(err.stack);  
    res.status(404).send('Resource Not Found!');  
    res.status(500).send('System Error!');  
    next();  
});
//监听8081端口
app.listen(8081, function(){
    console.log("Express server listening 8081");
});