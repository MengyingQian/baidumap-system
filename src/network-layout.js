var db = require('../lib/DBOperation.js');
var refer = require('..//lib/getRefer.js');
var calculate = require('../lib/calculate.js')
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function (params) {
    try{
        var referBase = await refer.getReferBase(params);//获取基站查询条件
        var baseInfo = await db.DB_base(referBase);//获取视野内基站信息
        var searchArr = await getSearchArr(baseInfo,params);//生成多个查询基站条件
        // var t1 = new Date();
        var operaInfo = await Promise.all(searchArr);//使用promise.all查询
        // var t2 = new Date();
        // console.log("search time: " + (t2.getTime()-t1.getTime()))
        // console.log("points number: " + baseInfo.length)
        var data = {
            station1: baseInfo,
            station2: operaInfo
        }
        var result = await calculate.layout(data);
        return {
            code: 0,
            msg: "success",
            data: {
                baseInfo: result
            }
        }
    }catch (err) {
        return {
            code: 1,
            msg: err
        }
    }
}

// 获取查找附近基站promise方法
function getSearchArr (data,params) {
    var resultArr = [];
    for (var i=0,len=data.length;i<len;i++) {
        resultArr.push(singleSearch(data[i],params));
    }
    // console.log(resultArr.length)
    return resultArr;
}


// 单个邻域查询查询
function singleSearch (data,params) {
    var search = function () {
        var nearParams = {
            corporation: params.corporation,
            system: params.system,
            nearPoint: data.geom.coordinates,
            objectID: data["对象标识"],
            limitNum: 6
        }
        var referBase = refer.getReferBase(nearParams);
        return db.DB_base(referBase);
        // return result;
    }
    return new Promise(function(resolve,reject){
        resolve(search(params));
    })
}