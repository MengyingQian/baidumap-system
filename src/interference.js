var db = require('../lib/DBOperation.js');
var refer = require('..//lib/getRefer.js');
var calculate = require('../lib/calculate.js')
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function (params) {
    try{
        var referBase = await refer.getReferBase(params);//获取基站查询条件
        var baseInfo = await db.DB_base(referBase);//获取视野内基站信息
        var searchArr = await getSearchArr(baseInfo,params);//生成多个查询栅格条件
        var resultArr = await Promise.all(searchArr);//使用promise.all查询
        var data = {
            station1: baseInfo,
            station2: resultArr
        }
        var result = await calculate.interference(data);
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
    console.log(resultArr.length)
    return resultArr;
}


// 单个邻域查询查询
function singleSearch (data,params) {
    var search = async function () {
        var nearParams = {
            corporation: params.corporation_inter,
            system: params.system_inter,
            freqRange: params.freqRange,
            nearPoint: data.geom.coordinates,
            objectID: data["对象标识"],
            limitNum: 1
        }
        var referBase = await refer.getReferBase(nearParams);
        var result = await db.DB_base(referBase);
        return result;
    }
    return new Promise(function(resolve,reject){
        resolve(search(params));
    })
}