var db = require('../lib/DBOperation');
var refer = require('..//lib/getRefer');
var _ = require('../lib/underscore.v1.8.3.js')

module.exports = function (params) {
    var props = ["业务时间"];
    
    const search = async function (params) {
        var params1 = await refer.getReferBase(params);//获取查询设置表的查询条件
        var result1 = await db.DB_base(params1);
        var params2 = await refer.getReferOperation(params,result1);
        var result2 = await db.DB_operation(params2);
        return organizeData({
                    baseInfo: result1,
                    operaInfo: result2
                })
    }
    return search(params);
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
    return baseInfo;
}