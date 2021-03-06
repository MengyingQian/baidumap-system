var db = require('../lib/DBOperation.js');
var refer = require('..//lib/getRefer.js');
var calculate = require('../lib/calculate.js')
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function(params){
    try{
        // var startTime = new Date();
        var referBase = await refer.getReferBase(params);//获取基站查询条件
        var baseInfo = await db.DB_base(referBase);//获取视野内基站信息
        var baseGrid = await getNearBase(baseInfo,params);// 基站栅格化并获取每个点的最近基站
        
        var result = await calculate.coverage(baseGrid);// 计算每个点接收功率

        // var endTime = new Date();
        // console.log("\n本次覆盖分析计算用时 " + (endTime.getTime() - startTime.getTime()) + " 毫秒");

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

//near base station
function getNearBase(baseInfo,params){
    // var t1 = new Date();
    var startLng = parseFloat(params.searchBox[0]);
    var startLat = parseFloat(params.searchBox[1]);
    var endLng = parseFloat(params.searchBox[2]);
    var endLat = parseFloat(params.searchBox[3]);
    var step = parseInt(params.step);//单位栅格边长（m）
    var maxDistance = parseInt(params.maxDistance);//单个点搜索范围
    var numLng = Math.ceil(maxDistance/step);//单个点搜索范围经度范围
    var numLat = Math.ceil(maxDistance/step);//单个点搜索范围纬度范围
    var minLng = step/(1000*111*Math.cos(startLat*Math.PI/180));// 单个栅格经度变化
    var minLat = step/(1000*111);// 单个栅格维度变化
    var n1 = Math.ceil((endLng-startLng)/minLng);//搜索区域内经度轴方格数
    var n2 = Math.ceil((endLat-startLat)/minLat);//搜索区域内纬度轴方格数
    var array = [];
    var calPoints = [];
    var basePoints = [];
    
    for(var i=0,length1=baseInfo.length;i<length1;i++){//将台站点置于对应的栅格内
        var x = parseInt((baseInfo[i].geom.coordinates[0]-startLng)/minLng);
        var y = parseInt((baseInfo[i].geom.coordinates[1]-startLat)/minLat);
        if (!array[x*n2+y]) {
            array[x*n2+y] = [];
        }
        array[x*n2+y].push(baseInfo[i]);
        //console.log(array[x*20+y]);
    }
    for(var i=numLng;i<n1-numLng;i++){//生成所有的待查询点并查询
        var lng=startLng+minLng*i;
        
        var minX = i-numLng;//确定X轴搜索范围
        var maxX = i+numLng;
        //console.log(i);
        for(var j=numLat;j<n2-numLat;j++){
            var lat=startLat+minLat*j;
            //console.log(j);
            var BSpoint = [];
            var minY = j-numLat;//确定Y轴搜索范围
            var maxY = j+numLat;
            //console.log(minY+'  '+maxY);
            for(var x=minX;x<maxX;x++){//查询临近基站
                for(var y=minY;y<maxY;y++){
                    if(!array[x*n2+y]) continue;
                    BSpoint = BSpoint.concat(array[x*n2+y]);
                }
            }
            // if (BSpoint.length>0) {
            //     calPoints.push([lng,lat]);//存入查询点
            //     basePoints.push(BSpoint);//存入附近基站点
            // }
            // 查询结果对比部分
            // if(lng === 106.7491333094491 && lat === 26.61821800900901) {
            //     console.log(BSpoint);
            // }
            // BSpoint.sort(function(pre,next){
            //     var preDis = 
            // })
            calPoints.push([lng,lat]);//存入查询点
            basePoints.push(BSpoint);//存入附近基站点
        }
    }
    //console.log(points2[160][0]);
    //console.log('最终长度'+calPoints.length);
    // 查询速度对比
    // var t2 = new Date();
    // console.log("\n本次邻域计算用时 " + (t2.getTime()-t1.getTime()) + " 毫秒");
    // console.log("\n测量点数目： " + calPoints.length);

    return {
        calPoints: calPoints,//测量点坐标
        basePoints: basePoints//对应基站点
    }
}