'use strict'

var mongodb =require('mongodb');
var _ = require('./underscore.v1.8.3.js')

//连接数据库
var server = new mongodb.Server("127.0.0.1", 27017, {auto_reconnect:true});
var db = new mongodb.Db('mydb', server, {safe:true});

/*
    基站设置表查询
    params：
    refer: 必填，设置表中的各个基站属性
    dbName: 必填，查询数据库名称
    limitNum: 可选，查询结果限制条数，undefined时不限制
*/
//属性查询，可以试着使用promise
function DB_base (params) {
    return new Promise(function(resolve,reject){
        var refer = params.refer;
        // console.log(refer)
        var dbName = params.dbName;
        var limitNum = params.limitNum || 0;
        db.open(function(err, db){
            if(err) throw err;
            //读取数据 
            db.collection(dbName, function (err,collection) {
                if(err) throw err;
                else{
                    collection.find(refer).limit(limitNum).toArray(function(err,docs){
                        if(err) throw  err;
                        console.log('数据总量'+docs.length);
                        // console.log(docs);
                        db.close();
                        resolve(docs);
                    });
                }
            });
        });
    })
}

//聚合查询
function DB_operation (params) {
    return new Promise(function(resolve,reject){
        var refer = params.refer;
        // console.log(refer)
        var dbName = params.dbName;
        db.open(function(err, db){
            if(err) throw err;
            //读取数据 
            db.collection(dbName, function (err,collection) {
                if(err) throw err;
                else{
                    collection.aggregate(refer).toArray(function(err,docs){
                        if(err) throw err;
                        console.log('数据总量'+docs.length);
                        // console.log(docs);
                        db.close();
                        resolve(docs);
                    });
                }
            });
        });
    })
}
//关闭数据库
db.on("close", function (err,db) {//关闭数据库
     if(err) throw err;
     else console.log("close");
 });


module.exports = {
    DB_base: DB_base,
    DB_operation: DB_operation,
    close : function(){db.close();}//关闭数据库
};