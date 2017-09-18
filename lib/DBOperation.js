'use strict'

var MongoClient =require('mongodb').MongoClient;
var _ = require('./underscore.v1.8.3.js')

//连接数据库
var url = "mongodb://localhost:27017/mydb"

/*
    基站设置表查询
    params：
    refer: 必填，设置表中的各个基站属性
    dbName: 必填，查询数据库名称
    limitNum: 可选，查询结果限制条数，undefined时不限制
*/
//属性查询，可以试着使用promise
function DB_base (params) {
    var refer = params.refer;
    // console.log(refer)
    var dbName = params.dbName;
    var limitNum = params.limitNum || 0;
    return new Promise(function(resolve,reject){
        MongoClient.connect(url,(err,db) => {
            if(err) throw err;
            var collection = db.collection(dbName);
            collection.find(refer).limit(limitNum).toArray(function(err,docs){
                if(err) throw  err;
                // console.log('数据总量'+docs.length);
                // console.log(docs);
                resolve(docs);
            });
        })
    })
}

/*
    基站运行表查询
    params：
    refer: 必填，设置表中的各个基站属性
    dbName: 必填，查询数据库名称
    limitNum: 可选，查询结果限制条数，undefined时不限制
*/
//聚合查询
function DB_operation (params) {
    return new Promise(function(resolve,reject){
        var refer = params.refer;
        // console.log(refer)
        var dbName = params.dbName;
        MongoClient.connect(url,(err,db) => {
            if(err) throw err;
            var collection = db.collection(dbName);
            collection.aggregate(refer).toArray(function(err,docs){
                if(err) throw  err;
                // console.log('数据总量'+docs.length);
                // console.log(docs);
                resolve(docs);
            });
        })
    })
}


module.exports = {
    DB_base: DB_base,
    DB_operation: DB_operation
};