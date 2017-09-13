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
function basicInfor (params) {
    var refer = {};
    if (params.dateRange) {
        refer["业务时间"] = {
            "$gt": params.dateRange[0],
            "$lt": params.dateRange[1]
        }
        delete params.dateRange;
    }
    if (params.freqRange) {
        refer["载波频点(MHz)"] = {
            "$gt": params.freqRange[0],
            "$lt": params.freqRange[1]
        }
        delete params.freqRange;
    }
    if (params.searchBox) {
        var box = [[parseFloat(params.searchBox[0]),parseFloat(params.searchBox[1])],[parseFloat(params.searchBox[2]),parseFloat(params.searchBox[3])]];
        refer['geom.coordinates'] = {$within:{$box:box}};
        delete params.searchBox;
    }
    _.extend(refer,params);

    db.open(function(err, db){
        if(err) throw err;
        //读取数据 
        db.collection(+refer['制式类型']+'_base', function (err,collection) {
            if(err) throw err;
            else{
                collection.find(refer,props).toArray(function(err,docs){
                    if(err) throw  err;
                    console.log('数据总量'+docs.length);
                    db.close();
                });
            }
        });
    });
}
//临近基站查询

/*
    基站运行表查询
    params：基站id和查询时间区间
*/

//关闭数据库
db.on("close", function (err,db) {//关闭数据库
     if(err) throw err;
     else console.log("close");
 });


// module.exports = {
//     attrQuery : attrQuery,
// //  drawQuery : drawQuery,
//     nearQuery : nearQuery,
//     aggrQuery : aggrQuery,
//     close : function(){db.close();}//关闭数据库
// };