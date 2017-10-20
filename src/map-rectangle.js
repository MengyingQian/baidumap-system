var db = require('../lib/DBOperation');
var refer = require('..//lib/getRefer');
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function (params) {
    try{
        if (!params.searchBox) throw "缺失地理位置参数"
        var searchArr = await getSearchArr(params);//生成多个查询栅格条件
        var resultArr = await Promise.all(searchArr);//使用promise.all查询
        var result = await getResult(resultArr);//将区域和基站点分别汇总到一起
        return {
            code: 0,
            msg: "success",
            data: result
        }
    }catch (err) {
        return {
            code: 1,
            msg: err
        }
    }  
}

function getResult (data) {
    var result = {
        searchBox: [],
        baseInfo: []
    }
    for(var i=0,len=data.length;i<len;i++){
        result.searchBox.push(data[i].searchBox);
        for(var j=0,len1=data[i].baseInfo.length;j<len1;j++){
            data[i].baseInfo[j].recIndex = i;
            result.baseInfo.push(data[i].baseInfo[j]);
        }
    }
    return result;
}

function getSearchArr (params) {
    //设置每次查询的地理范围
    var resultArr = [];
    var startLng = parseFloat(params.searchBox[0]);// 视野左下角经度
    var startLat = parseFloat(params.searchBox[1]);// 视野左下角维度
    var endLng = parseFloat(params.searchBox[2]);// 视野左上角经度
    var endLat = parseFloat(params.searchBox[3]);// 视野左上角维度
    var minLng = params.sideLength/(111*Math.cos(startLat*Math.PI/180));// 单个栅格经度变化
    var minLat = params.sideLength/111;// 单个栅格维度变化
    for (var lng=startLng;lng<endLng;lng+=minLng) {
        for(var lat=startLat;lat<endLat;lat+=minLat) {
            let obj = JSON.parse(JSON.stringify(params));
            obj.searchBox = [lng,lat,lng+minLng,lat+minLat];// 单次查询地理范围
            resultArr.push(singleSearch(obj));// 数组存储单次查询的promise
        }
    }
    return resultArr;
}

// 单个网格查询
function singleSearch (params) {
    const search = async function (params) {
        var params1 = await refer.getReferBase(params);//获取查询设置表的查询条件
        var result1 = await db.DB_base(params1);
        var params2 = await refer.getReferOperation(params,result1);
        var result2 = await db.DB_operation(params2);
        return organizeData({
                    searchBox: params.searchBox,
                    baseInfo: result1,
                    operaInfo: result2
                })
    }
    return new Promise(function(resolve,reject){
        resolve(search(params));
    });
}

// 将设置信息与运行信息汇总
function organizeData (obj) {
    var searchBox = obj.searchBox;
    var baseInfo = obj.baseInfo;
    var operaInfo = obj.operaInfo;
    for (let i=baseInfo.length-1;i>=0;i--){
        for(let j=operaInfo.length-1;j>=0;j--){
            if (baseInfo[i]["编号"] === operaInfo[j]["_id"]) {
                _.extend(baseInfo[i],operaInfo[j]);
                operaInfo.splice(j,1);
            }
        }
    }
    return {
        searchBox: searchBox,
        baseInfo: baseInfo
    };
}