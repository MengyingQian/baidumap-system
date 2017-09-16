var q = require('q');//q包实现promise

function getReferBase (params) {
    var defer = q.defer();

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
	defer.resolve({
        refer: refer,
        dbName: params.system+"_base"
    });
    return defer.promise;
}

function getReferOperation (params,resultBase) {
    var defer = q.defer();

    var idArr = [];
    resultBase.forEach(function(item){
        idArr.indexOf(item["编号"])===-1?idArr.push(item["编号"]):null;
    })
    var refer = {
        "编号": {"$in": idArr}
    }
    if (params.dateRange) {
        refer["业务时间"] = {
            "$gt": formatDate(params.dateRange[0]),
            "$lt": formatDate(params.dateRange[1])
        }
    }
    defer.resolve({
        refer: refer,
        dbName: params.system+"_operation"
    });
    return defer.promise;
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