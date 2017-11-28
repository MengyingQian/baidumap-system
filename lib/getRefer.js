function getReferBase (params) {
    // console.log("base",params)
    var refer = {
        "运营商类型": params.corporation?params.corporation:{ $exists : true },
        "制式类型": params.system?params.system:{ $exists : true }
    };
    if (params.freqRange) {
        refer["载波频点(MHz)"] = {
            "$gt": parseInt(params.freqRange[0]),
            "$lt": parseInt(params.freqRange[1])
        }
    } else if (params.frequence) {
        refer["载波频点(MHz)"] = {
            "$gt": params.frequence-500,
            "$lt": params.frequence+500
        }
    }

    // 矩形方格查询（也可使用polygon多边形查询，但是参数配置更复杂，适用于更为复杂的多边形）
    if (params.searchBox) {
        var box = [[parseFloat(params.searchBox[0]),parseFloat(params.searchBox[1])],[parseFloat(params.searchBox[2]),parseFloat(params.searchBox[3])]];
        refer['geom'] = {$geoWithin:{$box:box}};
    }

    // 邻近基站查询
    if (params.nearPoint) {
        var nearPoint = { 
            type: "Point",
            coordinates: params.nearPoint
        };
        refer['geom'] = {$nearSphere:{$geometry: nearPoint}};
    }
    // 避免选择到本基站
    if (params.objectID) {
        refer["对象标识"] = {'$ne':params.objectID?params.objectID:{ $exists : true }};

    }
        
    var result = {
        refer: refer,
        dbName: params.system+"_base"
    }
    // 基站查询数量限制
    if (params.limitNum) {
        result.limitNum = params.limitNum;
    }
    return result;
}

function getReferOperation (params,resultBase) {
    // console.log("operation",params)
    var idArr = [];
    resultBase.forEach(function(item){
        idArr.indexOf(item["编号"])===-1?idArr.push(item["编号"]):null;
    })
    var match = {
        "编号": {"$in": idArr}
    }
    if (params.dateRange) {
        match["业务时间"] = {
            "$gt": formatDate(params.dateRange[0]),
            "$lt": formatDate(params.dateRange[1])
        }
    }
    var sort = {
        "业务时间": 1// 查询结果根据条件升序排序
    }

    var group = {
        _id: "$编号"
    }
    var props = ["业务时间"];
    if (params.service) {
        switch (params.service) {
            case "all":
                props.push("语音数据(分钟)","短信数据(条数)","LTE上行总流量(MByte)","LTE下行总流量(MByte)");
                break;
            case "voice":
                props.push("语音数据(分钟)","短信数据(条数)");
                break;
            case "note":
                props.push("语音数据(分钟)","短信数据(条数)");
                break;
            case "dataTraffic":
                props.push("LTE上行总流量(MByte)","LTE下行总流量(MByte)");
                break;
            case "rate":
                props.push('LTE_无线利用率(新)(%)','LTE_上行PRB平均利用率(新)(%)','LTE_下行PRB平均利用率(新)(%)');
                break;
            default:
                break;
        }
    }

    for (var key in props) {
        group[props[key]] = {$push: "$" + props[key]}
    }
    var refer = [{
        $match: match//匹配筛选
    },{
        $sort: sort//排序
    },{
        $group: group//分组并分数组
    }]

    return{
        refer: refer,
        dbName: params.system+"_operation"
    };
}

function formatDate (date) {
	var date = new Date(date);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	return year + "/" + (month < 10?"0"+month : month) + "/" + (day < 10?"0"+day : day) + " " + (hour < 10?"0"+hour : hour) + ":00"
}

module.exports = {
	getReferBase: getReferBase,
	getReferOperation: getReferOperation
}