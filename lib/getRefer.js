
function getReferBase (params) {
    return new Promise(function(resolve,reject){
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
        }
        if (params.searchBox) {
            var box = [[parseFloat(params.searchBox[0]),parseFloat(params.searchBox[1])],[parseFloat(params.searchBox[2]),parseFloat(params.searchBox[3])]];
            refer['geom.coordinates'] = {$within:{$box:box}};
        }
        resolve({
            refer: refer,
            dbName: params.system+"_base"
        });
    })
}

function getReferOperation (params,resultBase) {
    console.log("getReferOperation")
    return new Promise(function(resolve,reject){
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

        console.log("refer2")
        resolve({
            refer: refer,
            dbName: params.system+"_operation"
        });
    })
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