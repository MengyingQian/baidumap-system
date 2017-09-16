var db = require('../lib/DBOperation');
var refer = require('..//lib/getRefer')

module.exports = function (params) {
    function* search (params) {
        var params1 = yield refer.getReferBase(params);//获取查询设置表的查询条件
        var result1 = yield db.searchDB(params1);
        var params2 = yield refer.getReferOperation(params,result1);
        var result2 = yield db.searchDB(params2);
        return {
            baseInfo: result1,
            operaInfo: result2
        }
    }
    function run (genF,params) {
        var g = genF(params);
        function next (data) {
            var res = g.next(data);
            if(res.done) return res.value;
            res.value.then(data => {
                next(data);
            })
        }
        next();
    }
    return run(search,params)
}

