var mongodb =require('mongodb');
var fs = require('fs');
var iconv = require('iconv-lite');
var server = new mongodb.Server("127.0.0.1", 27017, {auto_reconnect:true});
var db = new mongodb.Db('mydb', server, {safe:true});
db.open(function(err, db){
    if(err) throw err;
    //插入数据并显示
    db.collection("LTE_base", function (err,collection) {
      if(err) throw err;
      var fileStr = fs.readFileSync('taizhan_LTE.txt', {encoding:'binary'});
      var buf = new Buffer(fileStr, 'binary');
      var data = iconv.decode(buf, 'GBK');
      var dataline = data.split("\n");
      //console.log(dataline[100]);
      for(var i = 1;i<dataline.length/3-1;i=i+24){
        //存入数据库  
        //console.log(dataline[i].split("\x09")[0]);
        collection.insert({
                  "编号":Math.ceil(i/24),
                  "对象标识":dataline[i].split("\x09")[0],
                  "运营商类型": dataline[i].split("\x09")[1],
                  "制式类型": dataline[i].split("\x09")[2],
                  
                  "geom":{
                    "type":"Point",
                    "coordinates":[Number(dataline[i].split("\x09")[4]),Number(dataline[i].split("\x09")[5])]
                  },
                  "Azimuth(度)": Number(dataline[i].split("\x09")[6]),
                  "站高(m)": Number(dataline[i].split("\x09")[7]),
                  "DownTilt(度)": Number(dataline[i].split("\x09")[8]),
                  "载波频点(MHz)": Number(dataline[i].split("\x09")[9]),
                  "基站发射功率(dBm)": Number(dataline[i].split("\x09")[10]),
                  
                },
                {safe:true},function(err,result){});
      }
        
    //db.close(); 
    //setTimeout("db.close()",2000);
    });
    db.collection("LTE_operation ", function (err,collection) {
      if(err) throw err;
      var fileStr = fs.readFileSync('taizhan_LTE.txt', {encoding:'binary'});
      var buf = new Buffer(fileStr, 'binary');
      var data = iconv.decode(buf, 'GBK');
      var dataline = data.split("\n");
      var num = dataline.length;
      console.log(num);
      for(var i = 1;i<=(num-2)/3;i++){
        collection.insert({
          "编号":Math.ceil(i/24),
          "业务时间": dataline[i].split("\x09")[3],
          "共站情况":dataline[i].split("\x09")[11],
          "RRC连接建立请求次数(次)": Number(dataline[i].split("\x09")[12]),
          "RRC连接建立成功次数(次)": Number(dataline[i].split("\x09")[13]),
          "RRC连接建立成功率(%)": Number(dataline[i].split("\x09")[14]),
          "ERAB建立请求次数(次)": Number(dataline[i].split("\x09")[15]),
          "ERAB建立成功次数(次)": Number(dataline[i].split("\x09")[16]),
          "ERAB建立成功率(%)": Number(dataline[i].split("\x09")[17]),
          "无线接通率(%)": Number(dataline[i].split("\x09")[18]),
          "无线掉线次数新(次)": Number(dataline[i].split("\x09")[19]),
          "LTE_无线掉线率(%)": Number(dataline[i].split("\x09")[20]),
          "ERAB掉线次数(次)": Number(dataline[i].split("\x09")[21]),
          "LTE_E-RAB掉线率(新)(%)":Number(dataline[i].split("\x09")[22]),
          "RRC连接重建次数(%)": Number(dataline[i].split("\x09")[23]),
          "RRC连接重建比率(%)": Number(dataline[i].split("\x09")[24]),
          "eNB间切换请求次数(次)": Number(dataline[i].split("\x09")[25]),
          "eNB间切换成功次数(次)": Number(dataline[i].split("\x09")[26]),
          "eNB间切换成功率(%)": dataline[i].split("\x09")[27],
          "eNB内切换请求次数(次)": Number(dataline[i].split("\x09")[28]),
          "eNB内切换成功次数(次)": Number(dataline[i].split("\x09")[29]),
          "eNB内切换成功率(%)": dataline[i].split("\x09")[30],
          "同频切换请求次数(次)": Number(dataline[i].split("\x09")[31]),
          "同频切换成功次数(次)": Number(dataline[i].split("\x09")[32]),
          "同频切换成功率(%)": Number(dataline[i].split("\x09")[33]),
          "异频切换请求次数(次)": Number(dataline[i].split("\x09")[34]),
          "异频切换成功次数(次)": Number(dataline[i].split("\x09")[35]),
          "异频切换成功率(%)": dataline[i].split("\x09")[36],
          "系统内切换请求次数(次)": Number(dataline[i].split("\x09")[37]),
          "系统内切换成功次数(次)": Number(dataline[i].split("\x09")[38]),
          "切换成功率(%)": Number(dataline[i].split("\x09")[39]),
          "LTE切入GSM切换请求次数(次)": Number(dataline[i].split("\x09")[40]),
          "LTE切入GSM切换成功次数(次)": Number(dataline[i].split("\x09")[41]),
          "LTE切入GSM切换成功率(%)": dataline[i].split("\x09")[42],
          "小区用户面上行丢包率(百万分之一)": Number(dataline[i].split("\x09")[43]),
          "小区用户面下行丢包率(百万分之一)": Number(dataline[i].split("\x09")[44]),
          "小区用户面下行弃包率(百万分之一)": Number(dataline[i].split("\x09")[45]),
          "LTE_上行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[46]),
          "LTE_下行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[47]),
          "小区用户面下行平均时延(毫秒)": Number(dataline[i].split("\x09")[48]),
          "LTE_无线利用率(新)(%)": Number(dataline[i].split("\x09")[49]),
          "eNodeB寻呼拥塞率(%)": Number(dataline[i].split("\x09")[50]),
          "LTE上行总流量(MByte)": Number(dataline[i].split("\x09")[51]),
          "LTE下行总流量(MByte)": Number(dataline[i].split("\x09")[52]),
          "LTE_上行BLER(%)": Number(dataline[i].split("\x09")[53]),
          "LTE_下行BLER(%)": Number(dataline[i].split("\x09")[54]),
          "MAC层下行误块率(%)": Number(dataline[i].split("\x09")[55]),
          "RRC连接最大数(个)": Number(dataline[i].split("\x09")[56]),
          "RRC连接平均数(个)": Number(dataline[i].split("\x09")[57]),
          "语音数据(分钟)": Number(dataline[i].split("\x09")[58]),
          "短信数据(条数)": Number(dataline[i].split("\x09")[59])
        },
        
        {safe:true},function(err,result){});
}
for(var i = (num-2)/3+1;i<=(num-2)*2/3;i++){
  collection.insert({
    "编号":Math.ceil(i/24) - (num-2)/3/24,
    "业务时间": dataline[i].split("\x09")[3],
    "共站情况":dataline[i].split("\x09")[11],
    "RRC连接建立请求次数(次)": Number(dataline[i].split("\x09")[12]),
    "RRC连接建立成功次数(次)": Number(dataline[i].split("\x09")[13]),
    "RRC连接建立成功率(%)": Number(dataline[i].split("\x09")[14]),
    "ERAB建立请求次数(次)": Number(dataline[i].split("\x09")[15]),
    "ERAB建立成功次数(次)": Number(dataline[i].split("\x09")[16]),
    "ERAB建立成功率(%)": Number(dataline[i].split("\x09")[17]),
    "无线接通率(%)": Number(dataline[i].split("\x09")[18]),
    "无线掉线次数新(次)": Number(dataline[i].split("\x09")[19]),
    "LTE_无线掉线率(%)": Number(dataline[i].split("\x09")[20]),
    "ERAB掉线次数(次)": Number(dataline[i].split("\x09")[21]),
    "LTE_E-RAB掉线率(新)(%)":Number(dataline[i].split("\x09")[22]),
    "RRC连接重建次数(%)": Number(dataline[i].split("\x09")[23]),
    "RRC连接重建比率(%)": Number(dataline[i].split("\x09")[24]),
    "eNB间切换请求次数(次)": Number(dataline[i].split("\x09")[25]),
    "eNB间切换成功次数(次)": Number(dataline[i].split("\x09")[26]),
    "eNB间切换成功率(%)": dataline[i].split("\x09")[27],
    "eNB内切换请求次数(次)": Number(dataline[i].split("\x09")[28]),
    "eNB内切换成功次数(次)": Number(dataline[i].split("\x09")[29]),
    "eNB内切换成功率(%)": dataline[i].split("\x09")[30],
    "同频切换请求次数(次)": Number(dataline[i].split("\x09")[31]),
    "同频切换成功次数(次)": Number(dataline[i].split("\x09")[32]),
    "同频切换成功率(%)": Number(dataline[i].split("\x09")[33]),
    "异频切换请求次数(次)": Number(dataline[i].split("\x09")[34]),
    "异频切换成功次数(次)": Number(dataline[i].split("\x09")[35]),
    "异频切换成功率(%)": dataline[i].split("\x09")[36],
    "系统内切换请求次数(次)": Number(dataline[i].split("\x09")[37]),
    "系统内切换成功次数(次)": Number(dataline[i].split("\x09")[38]),
    "切换成功率(%)": Number(dataline[i].split("\x09")[39]),
    "LTE切入GSM切换请求次数(次)": Number(dataline[i].split("\x09")[40]),
    "LTE切入GSM切换成功次数(次)": Number(dataline[i].split("\x09")[41]),
    "LTE切入GSM切换成功率(%)": dataline[i].split("\x09")[42],
    "小区用户面上行丢包率(百万分之一)": Number(dataline[i].split("\x09")[43]),
    "小区用户面下行丢包率(百万分之一)": Number(dataline[i].split("\x09")[44]),
    "小区用户面下行弃包率(百万分之一)": Number(dataline[i].split("\x09")[45]),
    "LTE_上行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[46]),
    "LTE_下行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[47]),
    "小区用户面下行平均时延(毫秒)": Number(dataline[i].split("\x09")[48]),
    "LTE_无线利用率(新)(%)": Number(dataline[i].split("\x09")[49]),
    "eNodeB寻呼拥塞率(%)": Number(dataline[i].split("\x09")[50]),
    "LTE上行总流量(MByte)": Number(dataline[i].split("\x09")[51]),
    "LTE下行总流量(MByte)": Number(dataline[i].split("\x09")[52]),
    "LTE_上行BLER(%)": Number(dataline[i].split("\x09")[53]),
    "LTE_下行BLER(%)": Number(dataline[i].split("\x09")[54]),
    "MAC层下行误块率(%)": Number(dataline[i].split("\x09")[55]),
    "RRC连接最大数(个)": Number(dataline[i].split("\x09")[56]),
    "RRC连接平均数(个)": Number(dataline[i].split("\x09")[57]),
    "语音数据(分钟)": Number(dataline[i].split("\x09")[58]),
    "短信数据(条数)": Number(dataline[i].split("\x09")[59])
  },
  
  {safe:true},function(err,result){});
}
for(var i = (num-2)*2/3+1;i<num-1;i++){
  collection.insert({
    "编号":Math.ceil(i/24) - (num-2)*2/3/24,
    "业务时间": dataline[i].split("\x09")[3],
    "共站情况":dataline[i].split("\x09")[11],
    "RRC连接建立请求次数(次)": Number(dataline[i].split("\x09")[12]),
    "RRC连接建立成功次数(次)": Number(dataline[i].split("\x09")[13]),
    "RRC连接建立成功率(%)": Number(dataline[i].split("\x09")[14]),
    "ERAB建立请求次数(次)": Number(dataline[i].split("\x09")[15]),
    "ERAB建立成功次数(次)": Number(dataline[i].split("\x09")[16]),
    "ERAB建立成功率(%)": Number(dataline[i].split("\x09")[17]),
    "无线接通率(%)": Number(dataline[i].split("\x09")[18]),
    "无线掉线次数新(次)": Number(dataline[i].split("\x09")[19]),
    "LTE_无线掉线率(%)": Number(dataline[i].split("\x09")[20]),
    "ERAB掉线次数(次)": Number(dataline[i].split("\x09")[21]),
    "LTE_E-RAB掉线率(新)(%)":Number(dataline[i].split("\x09")[22]),
    "RRC连接重建次数(%)": Number(dataline[i].split("\x09")[23]),
    "RRC连接重建比率(%)": Number(dataline[i].split("\x09")[24]),
    "eNB间切换请求次数(次)": Number(dataline[i].split("\x09")[25]),
    "eNB间切换成功次数(次)": Number(dataline[i].split("\x09")[26]),
    "eNB间切换成功率(%)": dataline[i].split("\x09")[27],
    "eNB内切换请求次数(次)": Number(dataline[i].split("\x09")[28]),
    "eNB内切换成功次数(次)": Number(dataline[i].split("\x09")[29]),
    "eNB内切换成功率(%)": dataline[i].split("\x09")[30],
    "同频切换请求次数(次)": Number(dataline[i].split("\x09")[31]),
    "同频切换成功次数(次)": Number(dataline[i].split("\x09")[32]),
    "同频切换成功率(%)": Number(dataline[i].split("\x09")[33]),
    "异频切换请求次数(次)": Number(dataline[i].split("\x09")[34]),
    "异频切换成功次数(次)": Number(dataline[i].split("\x09")[35]),
    "异频切换成功率(%)": dataline[i].split("\x09")[36],
    "系统内切换请求次数(次)": Number(dataline[i].split("\x09")[37]),
    "系统内切换成功次数(次)": Number(dataline[i].split("\x09")[38]),
    "切换成功率(%)": Number(dataline[i].split("\x09")[39]),
    "LTE切入GSM切换请求次数(次)": Number(dataline[i].split("\x09")[40]),
    "LTE切入GSM切换成功次数(次)": Number(dataline[i].split("\x09")[41]),
    "LTE切入GSM切换成功率(%)": dataline[i].split("\x09")[42],
    "小区用户面上行丢包率(百万分之一)": Number(dataline[i].split("\x09")[43]),
    "小区用户面下行丢包率(百万分之一)": Number(dataline[i].split("\x09")[44]),
    "小区用户面下行弃包率(百万分之一)": Number(dataline[i].split("\x09")[45]),
    "LTE_上行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[46]),
    "LTE_下行PRB平均利用率(新)(%)": Number(dataline[i].split("\x09")[47]),
    "小区用户面下行平均时延(毫秒)": Number(dataline[i].split("\x09")[48]),
    "LTE_无线利用率(新)(%)": Number(dataline[i].split("\x09")[49]),
    "eNodeB寻呼拥塞率(%)": Number(dataline[i].split("\x09")[50]),
    "LTE上行总流量(MByte)": Number(dataline[i].split("\x09")[51]),
    "LTE下行总流量(MByte)": Number(dataline[i].split("\x09")[52]),
    "LTE_上行BLER(%)": Number(dataline[i].split("\x09")[53]),
    "LTE_下行BLER(%)": Number(dataline[i].split("\x09")[54]),
    "MAC层下行误块率(%)": Number(dataline[i].split("\x09")[55]),
    "RRC连接最大数(个)": Number(dataline[i].split("\x09")[56]),
    "RRC连接平均数(个)": Number(dataline[i].split("\x09")[57]),
    "语音数据(分钟)": Number(dataline[i].split("\x09")[58]),
    "短信数据(条数)": Number(dataline[i].split("\x09")[59])
  },
  
  {safe:true},function(err,result){});
}
    });
    
});
db.on("close", function (err,db) {//关闭数据库
     if(err) throw err;
     else console.log("close");
 });