'use strict'

var mongodb =require('mongodb');
var q = require('q');//q包实现promise
var _ = require('./underscore.v1.8.3.js')

//连接数据库
var server = new mongodb.Server("127.0.0.1", 27017, {auto_reconnect:true});
var db = new mongodb.Db('mydb', server, {safe:true});

/*
    基站设置表查询
    params：设置表中的各个基站属性
*/
//属性查询，可以试着使用promise
function basicInfor (refer) {
    var defer = q.defer();
    db.open(function(err, db){
        if(err) throw err;
        //读取数据 
        console.log("refer",refer)
        db.collection(refer['制式类型']+'_base', function (err,collection) {
            if(err) throw err;
            else{
                collection.find(refer).toArray(function(err,docs){
                    if(err) throw  err;
                    console.log('数据总量'+docs.length);
                    // console.log(docs);
                    // db.close();
                    defer.resolve(docs);
                });
            }
        });
    });
    return defer.promise;
}
//临近基站查询

/*
    基站运行表查询
    params：基站id和查询时间区间
*/
function operationInfor (refer) {
    var defer = q.defer();
    db.open(function(err, db){
        if(err) throw err;
        //读取数据 
        console.log("refer",refer)
        db.collection(refer['制式类型']+'_operation', function (err,collection) {
            if(err) throw err;
            else{
                collection.find(refer).toArray(function(err,docs){
                    if(err) throw  err;
                    console.log('数据总量'+docs.length);
                    // console.log(docs);
                    // db.close();
                    defer.resolve(docs);
                });
            }
        });
    });
    return defer.promise;
}

//关闭数据库
db.on("close", function (err,db) {//关闭数据库
     if(err) throw err;
     else console.log("close");
 });


module.exports = {
    basicInfor : basicInfor,
    close : function(){db.close();}//关闭数据库
};