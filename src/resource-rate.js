var db = require('../lib/DBOperation');
var refer = require('..//lib/getRefer');
var calculate = require('../lib/calculate.js')
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = async function (params) {
	try{
		var params1 = await refer.getReferBase(params);//获取查询设置表的查询条件
		var baseInfo = await db.DB_base(params1);
		console.log(1)
		var params2 = await refer.getReferOperation(params,baseInfo);
		var operaInfo = await db.DB_operation(params2);
		console.log(2)
		var data = await organizeData({
			baseInfo: baseInfo,
			operaInfo: operaInfo
		})
		var result = await calculate.rate(data);
		console.log(3)
		return {
		    code: 0,
		    msg: "success",
		    data: {
                baseInfo: result
            }
		}
	}catch(err){
		return {
		    code: 1,
		    msg: err
		}
	}
}

// 将设置信息与运行信息汇总
function organizeData (obj) {
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
        baseInfo: baseInfo
    };
}