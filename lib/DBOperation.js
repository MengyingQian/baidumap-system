'use strict'

//包含mongodb基本模块
var mongodb =require('mongodb');
//包含q包，实现promise
var q = require('q');
//连接数据库
var server = new mongodb.Server("127.0.0.1", 27017, {auto_reconnect:true});
var db = new mongodb.Db('mydb', server, {safe:true});

/*
    基站设置表查询
    params：设置表中的各个基站属性
*/
//属性查询，可以试着使用promise

//临近基站查询

/*
    基站运行表查询
    params：基站id和查询时间区间
*/

//属性查询
//传入json查询条件
function attrQuery(refer,prop){
    //使用promise
    var defer = q.defer();
    var number = number||0;
    var props = {//提取所需属性
                '对象标识':1,
                '运营商类型':1,
                '制式类型':1,
                'geom':1,
                'Azimuth(度)':1,
                '站高(m)':1,
                'DownTilt(度)':1,
                '基站发射功率(dBm)':1,
                '载波频点(MHz)':1,
                '共站情况':1,
                '业务时间':1,
                '_id':0
            };
    for(var i=0;i<prop.length;i++){
        props[prop[i]] = 1;
    }
    if(refer.hasOwnProperty('frequence')){
        refer['载波频点(MHz)'] = {"$gt":parseInt(refer.frequence[0]),"$lt":parseInt(refer.frequence[1])};
        delete refer.frequence;
    }
    if(refer.hasOwnProperty('searchBox')){
        var box = [[parseFloat(refer.searchBox[0]),parseFloat(refer.searchBox[1])],[parseFloat(refer.searchBox[2]),parseFloat(refer.searchBox[3])]];
        refer['geom.coordinates'] = {$within:{$box:box}};
        delete refer.searchBox;
    }
    var startTime = refer['业务时间']['$gt'];
    var endTime = refer['业务时间']['$lt'];
    //console.log(refer);
    //console.log(props);
    db.open(function(err, db){
        if(err) throw err;
        //读取数据 
        db.collection("taizhan_"+refer['制式类型'], function (err,collection) {
            if(err) throw err;
            else{
                collection.find(refer,props).toArray(function(err,docs){
                    if(err) throw  err;
                    console.log('数据总量'+docs.length);
                    db.close();
                    var data = organizeData(docs,startTime,endTime,prop);
                    defer.resolve(data);
                });
            }
        });
        
    });
    return defer.promise;
};

//查询临近台站
function nearQuery(refer,prop,number){
    //使用promise
    var defer = q.defer();
    var props = {//提取所需属性
                '对象标识':1,
                '运营商类型':1,
                '制式类型':1,
                'geom':1,
                'Azimuth(度)':1,
                '站高(m)':1,
                'DownTilt(度)':1,
                '基站发射功率(dBm)':1,
                '载波频点(MHz)':1,
                '共站情况':1,
                '业务时间':1,
                '_id':0
            };
    for(var i=0;i<prop.length;i++){
        props[prop[i]] = 1;
    }
    //console.log(2);
    db.open(function(err, db){
        if(err) throw err;
         //读取数据 
        db.collection("taizhan_"+refer['制式类型'], function (err,collection) {
            if(err) throw err;
            else{
                collection.find(refer,props).limit(number).toArray(function(err,docs){
                    if(err) throw  err;
                    //console.log('数据总量'+docs.length);
                    //console.log(docs instanceof Array);
                    db.close();
                    defer.resolve(docs);
                });
            }
        });
    });
    return defer.promise;
};

//mongodb中aggregate聚合查询
function aggrQuery(refer){
    var defer = q.defer();
    //console.log(refer.system);
    var query = { 
        _id:"$"+refer.system
    };
    switch(refer.attr){
        //获取最小和最大时间
        case '业务时间':
            query.Maxtime = {$max:'$业务时间'};
            query.Mintime = {$min:'$业务时间'};
            break;
        //获取平均天线高度
        case '站高(m)':
            query.Avgheight = {$avg:'$站高(m)'};
            break;
    }
    db.open(function(err, db){
        //aggregate
        db.collection("taizhan_"+refer.system, function (err,collection) {
            if(err) throw err;
            else{
                collection.aggregate([{$group : query}],function(err,docs){
                    if(err) throw  err;
                    else{
                        console.log(docs[0]);
                        db.close();
                        defer.resolve(docs[0]);
                    }
                })
            }
        });
    });
    return defer.promise;
};


//空间查询
//传入两对坐标点
/*function drawQuery(refer,prop){
    //使用promise
    var defer = q.defer();
    var props = {//提取所需属性
                '对象标识':1,
                '运营商类型':1,
                '制式类型':1,
                'geom':1,
                'Azimuth(度)':1,
                '站高(m)':1,
                'DownTilt(下倾角/度)':1,
                '基站发射功率(dBm)':1,
                '载波频点(MHz)':1,
                '共站情况':1,
                '_id':0
            };
    for(var i=0;i<prop.length;i++){
        props[prop[i]] = 1;
    }
    //console.log(props);
    var box = [[parseFloat(refer.searchBox[0]),Number(refer.searchBox[1])],[Number(refer.searchBox[2]),Number(refer.searchBox[3])]];
    db.open(function(err, db){
    if(err) throw err;
    //读取数据 
    db.collection("taizhan_LTE", function (err,collection) {
            if(err) throw err;
            else{
                //console.log(typeof refer.startLat);
                //console.log(box);
                collection.find({"geom.coordinates":{$within:{$box:box}}}).toArray(function(err,docs){
                    if(err) throw  err;
                    console.log('数据总量'+docs.length);
                    docs.push(prop);//添加了数据需求，此处注意
                    defer.resolve(docs);
                });
            }
        });
    
});
    return defer.promise;
};*/
//关闭数据库
db.on("close", function (err,db) {//关闭数据库
     if(err) throw err;
     else console.log("close");
 });

//整理汇总数据
function organizeData(data,startTime,endTime,prop){
    var id = '';
    var name = [];
    var rData = [];
    var j = 0;
    var m = 0;
    var nowTime = startTime;
    //console.log(startTime+'    '+endTime);
    for(var i=0;i<data.length;i++){
        if(name.indexOf(data[i]['对象标识']) === -1){
            name.push(data[i]['对象标识']);
            j = name.indexOf(data[i]['对象标识']);
            rData[j] = new Object();
            rData[j]['对象标识'] = data[i]['对象标识'];
            rData[j]['运营商类型'] = data[i]['运营商类型'];
            rData[j]['制式类型'] = data[i]['制式类型'];
            rData[j]['Azimuth(度)'] = data[i]['Azimuth(度)'];
            rData[j]['业务时间'] = data[i]['业务时间'];
            rData[j]['站高(m)'] = data[i]['站高(m)'];
            rData[j]['基站发射功率(dBm)'] = data[i]['基站发射功率(dBm)'];
            rData[j]['DownTilt(度)'] = data[i]['DownTilt(度)'];
            rData[j]['载波频点(MHz)'] = data[i]['载波频点(MHz)'];
            rData[j]['共站情况'] = data[i]['共站情况'];
            rData[j].geom = data[i].geom;
            for(var k=0;k<prop.length;k++){
            rData[j][prop[k]] = [];
            }
        }
        j = name.indexOf(data[i]['对象标识']);//指向当前数据归属的台站
        //汇总各时间段数据
        for(var k=0;k<prop.length;k++){
            rData[j][prop[k]].push(data[i][prop[k]]);
        }
    }
    console.log('台站数目'+rData.length);
    return rData;
    //console.log(Date.now()-t1);
}



module.exports = {
    attrQuery : attrQuery,
//  drawQuery : drawQuery,
    nearQuery : nearQuery,
    aggrQuery : aggrQuery,
    close : function(){db.close();}//关闭数据库
};