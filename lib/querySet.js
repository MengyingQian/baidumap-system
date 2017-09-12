'use strict'
var tt = require('./DBOperation');
var q = require('q');
//near interference base station
//在mongodb数据库中需要使用索引
//递归大法好
function NIBS(data1,condition,i){
    //console.log(1);
    var refer={
        '运营商类型':condition["运营商类型"],
        '制式类型':condition["制式类型"],
        '业务时间':condition["业务时间"],
        "对象标识" : {'$ne':data1[i]['对象标识']},
        "geom.coordinates":{//临近点查询
            $near:data1[i].geom.coordinates,//坐标数组
            //spherical:true,
            //distanceMultiplier: 6378137,
            //$maxDistance:1/111.12//一度是约111.12公里
        },
    };
    if(condition['载波频点(MHz)']){
        refer['载波频点(MHz)'] = {
            "$gt":data1[i]['载波频点(MHz)']-500,
            "$lt":data1[i]['载波频点(MHz)']+500
        };
    }
    //console.log(refer);
    //查询数目限制只能使用nearquery
    return tt.nearQuery(refer,[],parseInt(condition.number))
        .then(function(data){
            //console.log(i);
            if(i-- == 0){//递归结束条件
                return [data];
            }
            return NIBS(data1,condition,i)
                .then(function(nextData){
                    return [].concat(nextData,[data]);//合并递归内容，注意前后两者之间的顺序
                });
        });
};

//near base station
function NBS(data,searchBox){
    var startLng = parseFloat(searchBox.startPoint[0]);
    var startLat = parseFloat(searchBox.startPoint[1]);
    var endLng = parseFloat(searchBox.endPoint[0]);
    var endLat = parseFloat(searchBox.endPoint[1]);
    var recLength = parseInt(searchBox.recLength);//单位栅格边长（m）
    var maxDistance = parseInt(searchBox.maxDistance);//单个点搜索范围
    var numLng = Math.ceil(maxDistance/recLength);//单个点搜索范围经度半径
    var numLat = Math.ceil(maxDistance/recLength);//单个点搜索范围纬度半径
    var minLng = 0.0000117*recLength;//单位栅格的经度跨度
    var minLat = 0.000009*recLength;//单位栅格的纬度跨度
    var n1 = Math.ceil((endLng-startLng)/minLng);//搜索区域内经度轴方格数
    var n2 = Math.ceil((endLat-startLat)/minLat);//搜索区域内纬度轴方格数
    console.log('总数目:'+n1+'  '+n2);
/*  var n1 = 100;//视野内经度轴方格数
    var n2 = 100;//视野内纬度轴方格数
    var minLng = parseFloat((endLng-startLng)/n1);//网格经度変化
    var minLat = parseFloat((endLat-startLat)/n2);//网格纬度变化*/
    //console.log('台站数目'+length);
    var array = [];
    var points = [];
    var points2 = [];
    for(var i=0;i<n1*n2;i++){
        array.push([]);
    }
    //将台站点置于对应的栅格内
    for(var i=0,length1=data.length;i<length1;i++){
        var x = parseInt((data[i].geom.coordinates[0]-startLng)/minLng);
        var y = parseInt((data[i].geom.coordinates[1]-startLat)/minLat);
        //console.log(x+' '+y);
        array[x*n2+y].push(data[i]);
        //console.log(array[x*20+y]);
    }
    //生成所有的待查询点并查询
    (function(){
        for(var i=numLng;i<n1-numLng;i++){
            var lng=startLng+minLng*i;
            //确定X轴搜索范围
            var minX = (i-numLng<0)?0:(i-numLng);
            var maxX = (i+numLng>n1)?n1:(i+numLng);
            //console.log(i);
            for(var j=numLat;j<n2-numLat;j++){
                var lat=startLat+minLat*j;
                //console.log(j);
                var BSpoint = [];
                //查询临近基站
                //确定Y轴搜索范围
                var minY = (j-numLat<0)?0:(j-numLat);
                var maxY = (j+numLat>n2)?n2:(j+numLat);
                //console.log(minY+'  '+maxY);
                for(var x=minX;x<maxX;x++){
                    for(var y=minY;y<maxY;y++){
                        BSpoint = BSpoint.concat(array[x*n2+y]);
                    }
                }
                //存入查询点
                points.push([lng,lat]);
                //存入附近基站点
                points2.push(BSpoint);
            }
        }
        //console.log(points2[160][0]);
        //console.log('最终长度'+points.length);
    })();
    return {
            station1 : points,
            station2 : points2
    };
};

module.exports = {
    NIBS:NIBS,
    NBS : NBS
};


