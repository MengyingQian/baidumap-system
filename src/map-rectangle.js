var db = require('../lib/DBOperation');
var refer = require('..//lib/getRefer');
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function (params) {
    try{
        if (!params.searchBox) throw "缺失地理位置参数"
        // var searchArr = await getSearchArr(params);//生成多个查询栅格条件
        // var t1 = new Date();
        // var resultArr = await Promise.all(searchArr);//使用promise.all查询        
        // var t2 = new Date();
        // console.log("search time: " + (t2.getTime()-t1.getTime()))
        // console.log("points number: " + resultArr.length)
        // var result = await getResult(resultArr);//将区域和基站点分别汇总到一起


        var startLng = parseFloat(params.searchBox[0]);// 视野左下角经度
        var startLat = parseFloat(params.searchBox[1]);// 视野左下角维度
        var endLng = parseFloat(params.searchBox[2]);// 视野右上角经度
        var endLat = parseFloat(params.searchBox[3]);// 视野右上角维度
        var minLng = params.sideLength/(111*Math.cos(startLat*Math.PI/180));// 单个栅格经度变化
        var minLat = params.sideLength/111;// 单个栅格维度变化
        params.searchBox[2] = params.searchBox[0] + Math.ceil((params.searchBox[2]-params.searchBox[0])/minLng)*minLng;
        params.searchBox[3] = params.searchBox[1] + Math.ceil((params.searchBox[3]-params.searchBox[1])/minLat)*minLat;
        var params1 = await refer.getReferBase(params);//获取查询设置表的查询条件
        var baseInfo = await db.DB_base(params1);
        var params2 = await refer.getReferOperation(params,baseInfo);
        var operaInfo = await db.DB_operation(params2);
        var result = await organizeData_all({
                    searchBox: params.searchBox,
                    baseInfo: baseInfo,
                    operaInfo: operaInfo,
                    minLng: minLng,
                    minLat: minLat
                })
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
    // console.log("栅格数目" + result.baseInfo.length)
    // console.log("基站数目" + result.searchBox.length)
    return result;
}

// [
//                 106.81765190570003,
//                 26.654254045045047,
//                 106.82772816985458,
//                 26.663263054054056
//             ]

function getSearchArr (params) {
    //设置每次查询的地理范围
    var resultArr = [];
    var startLng = parseFloat(params.searchBox[0]);// 视野左下角经度
    var startLat = parseFloat(params.searchBox[1]);// 视野左下角维度
    var endLng = parseFloat(params.searchBox[2]);// 视野右上角经度
    var endLat = parseFloat(params.searchBox[3]);// 视野右上角维度
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
        return organizeData_single({
                    searchBox: params.searchBox,
                    baseInfo: result1,
                    operaInfo: result2
                })
    }
    return new Promise(function(resolve,reject){
        resolve(search(params));
    });
}



// 将设置信息与运行信息汇总-分栅格查询
function organizeData_single (obj) {
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
    // console.log(baseInfo.length)
    return {
        searchBox: searchBox,
        baseInfo: baseInfo
    };
}

// 将设置信息与运行信息汇总-整体查询
function organizeData_all (obj) {
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
    var searchBox = [];
    var startLng = parseFloat(obj.searchBox[0]);// 视野左下角经度
    var startLat = parseFloat(obj.searchBox[1]);// 视野左下角维度
    var endLng = parseFloat(obj.searchBox[2]);// 视野右上角经度
    var endLat = parseFloat(obj.searchBox[3]);// 视野右上角维度
    var minLng = obj.minLng;// 单个栅格经度变化
    var minLat = obj.minLat;// 单个栅格维度变化
    // console.log(obj.searchBox)
    for (var lng=startLng;lng<endLng;lng+=minLng) {
        for(var lat=startLat;lat<endLat;lat+=minLat) {
            searchBox.push([lng,lat,lng+minLng,lat+minLat]);
        }
    }
    // console.log("栅格数目" + searchBox.length)
    // console.log("基站数目" + baseInfo.length)
    return {
        searchBox: searchBox,
        baseInfo: baseInfo
    };
}