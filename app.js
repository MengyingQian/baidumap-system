'use strict'

var express = require("express");
var bodyParser = require('body-parser');
var db = require('./lib/DBOperation');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 

//允许跨域
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method == 'OPTIONS') {
        console.log("OPTIONS")
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});

//接收请求
app.post('/mapRectangle',function(req,res){
    console.log(req.body);
    var data = {
        code: 0,
        msg: "success",
        data: {
            name: "liqiang"
        }
    }
    res.send({data});
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