//计算资源利用率
function rate(rData){
    let props1 = ['LTE_无线利用率(新)(%)','LTE_上行PRB平均利用率(新)(%)','LTE_下行PRB平均利用率(新)(%)'];
    let props2 = ['LTE_无线利用率相关性()','LTE_上行PRB平均利用率相关性()','LTE_下行PRB平均利用率相关性()'];
    for(let i=0,len=rData.length;i<len;i++){
        rData[i]['LTE_无线利用率相关性()'] = sourceRate(rData[i]['LTE_无线利用率(新)(%)']);
        rData[i]['LTE_上行PRB平均利用率相关性()'] = sourceRate(rData[i]['LTE_上行PRB平均利用率(新)(%)']);
        rData[i]['LTE_下行PRB平均利用率相关性()'] = sourceRate(rData[i]['LTE_下行PRB平均利用率(新)(%)']);
    }
    return rData;
    //input中内容为查询时间段内台站每一属性的集合
    //此处input指存储一组数据
    function sourceRate(input){
        //获取每一组数据长度
        let number_time = input.length;
        let x = [];
        for (let i=0;i<number_time;i++){
            x[i] = i;
        }

        let y = [];
        //求概率密度
        for (let i=0;i<number_time;i++){
          y[i] = normpdf(x[i],0,1);        
        }                         

        let aa = [];
        let result = [];
        let yy=y.reverse();

        for (let i = 0;i<number_time;i++){//应该是end-numbertime
            aa = conv(input,yy);  
            result[i] = aa[number_time+i-1];
        }
        //console.log(result);
        return result;
        //console.log(result);
    }
    //概率密度函数
    function normpdf(x, miu, sig){   
        let pdf = Math.pow(Math.sqrt(2*Math.PI)*sig,-1)*Math.pow(Math.E,-Math.pow(x-miu,2)/2*sig*sig);  
        return pdf; 
    }
    //自相关函数
    function conv(a,b){  
        let M = a.length;
        let N=b.length;
        let S = [];
        let B = [];
        let BB = [];
        let A = a.reverse();
        for (let i=0;i<M-1;i++){
            B[i] = 0;
            BB[i] = 0};
        B = B.concat(b).concat(BB);
        for (let i=0;i<M+N-1;i++){
            S[i] = 0;
            let n=0;
            for (let j=0;j<M;j++){
                let temp=A[j]*B[i+j];
                if (B[i+j]!=0){
                    n=n+1;
                }
                S[i]=S[i]+temp;
            }
            S[i]=S[i]/n;
        }
        return S;
    }
}


//干扰分析
function interference(data){
    console.log("come");
    var rData = data.station1;
    var data2 = data.station2;
    var number_BS = rData.length;
    var input = [];
    var props=['站高(m)','DownTilt(度)','Azimuth(度)','载波频点(MHz)','基站发射功率(dBm)'];
    for (var i=0;i<number_BS;i++){
        var temp1 = [];
        var temp2 = [];
        rData[i]['rePoints'] = data2[i][0]['geom']['coordinates'];
        temp1.push(rData[i].geom.coordinates[0],rData[i].geom.coordinates[1]);
        temp2.push(data2[i][0].geom.coordinates[0],data2[i][0].geom.coordinates[1]);
        for(var j=0,len=props.length;j<len;j++){
            temp1.push(rData[i][props[j]]);
            temp2.push(data2[i][0][props[j]]);
        }
        input.push(temp1.concat(temp2));
    }
    //console.log(dataline)
    var coordinate_sBS00 = [];
    var coordinate_sBS01 = [];
    var coordinate_gBS00 = [];
    var coordinate_gBS01 = [];
    var coordinate_sBSS0 = [];
    var coordinate_sBSS1 = [];
    var tilt_down = [];

    //console.log(input)
    for (var i=0;i<number_BS;i++){
        coordinate_sBS00[i] = input[i][0];
        coordinate_sBS01[i] = input[i][1];
        coordinate_gBS00[i] = input[i][8];
        coordinate_gBS01[i] = input[i][9];
        coordinate_sBSS0[i] = (coordinate_gBS00[i] - coordinate_sBS00[i])*111*Math.cos(coordinate_gBS01[i]); 
        coordinate_sBSS1[i] = (coordinate_gBS01[i] - coordinate_sBS01[i])*111;          

        var coordinate_sBS0 = [coordinate_sBS00,coordinate_sBS01];
        var coordinate_gBS0 = [coordinate_gBS00,coordinate_gBS01];
        var coordinate_sBS = [coordinate_sBSS0,coordinate_sBSS1];
        var f = 2;                                         
        var r = 0.15;                                        
        var number_User = 60;                               
        var wallthrowLoss = 0;       
        var power_gBS = input.map(function (item,i) { return Math.pow(10,input[i][14]/10)});        
        var power_UE_Max = Math.pow(10,23/10);                       
        var power_UE_Min = Math.pow(10,-30/10);                     
        var height_sUE = 1/1000;                             
        var gain_sUE = Math.pow(10,-4/10);            
        var height_gBS = input.map(function (item,i) {return input[i][10]/1000}) ;     
        var height_sBS = input.map(function (item,i) {return input[i][2]/1000})   ;
        // tilt_down[0] = [];
        // tilt_down[1] = [];
        // tilt_down[0][i] = input[i][3];    
        // tilt_down[1][i] = input[i][11];               
        // tilt_direct[0] = [];
        // tilt_direct[1] = [];
        // tilt_direct[0][i] = input[i][4];                 
        // tilt_direct[1][i] = input[i][12];
    }
    var arr = [];
    for (var i=0;i<number_BS;i++){
        arr.push(0);
    }
    var interference_UE_sBS  = [];
    for (var i=0;i<number_User*3;i++){
        interference_UE_sBS.push(arr.concat());
    }
    var probability_UE_sBS = [];
    for (var i=0;i<number_BS;i++){
        probability_UE_sBS.push(0);
    }
    var ACLR = [41.57,42.97,44.37,45.77,47.17,47.35,47.35,47.35,47.35,47.35,47.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,59.35,69.35,69.35,69.35,69.35,69.35,69.35,69.35,69.35,69.35,69.35];
     //ACLR = 10.^(ACLR./10);
    ACLR = ACLR.map(function (item,i) {
              return Math.pow(10,ACLR[i]/10);
            });
    var distance_sBS_gBS = coordinate_sBSS0.map(function (item,i) {
            return Math.sqrt(Math.pow(coordinate_sBSS0[i],2)+Math.pow(coordinate_sBSS1[i],2)+Math.pow(height_gBS[i]-height_sBS[i],2));
          });


    var pathLoss_sBS_gBS =  distance_sBS_gBS.map(function (item,i) {
       return Math.pow(10,(92.5+20*Math.log(f)/Math.log(10)+20*Math.log(distance_sBS_gBS[i])/Math.log(10)+(0.0072+0.0012)*distance_sBS_gBS[i])/10);
     });

    var ceter3db=65;                   
    var D = [[],[]] ; 
    var C = [[],[]] ; 
    var C1 = [[],[]] ;
    var angle1 = [[],[]];   
    var angle2 = [[],[]];    
    var gain_gBS_sBS0 = [[],[]]; 
    var gain_gBS_sBS = [[],[]];

    for(var i=0;i<number_BS;i++) {
        D[0].push(20);
        D[1].push(20);
        angle1[0].push(0);
        angle1[1].push(0);
        angle2[0].push(0);
        angle2[1].push(0);
    }
       
    var tilt_down_Radian = [[],[]] ; 
    for (var i=0;i<number_BS;i++){
        tilt_down_Radian[0][i] =  input[i][3]*Math.PI/180;
        tilt_down_Radian[1][i] =  input[i][11]*Math.PI/180;
    }
    var angle;
    var differ_height = [];

    function heaviside(x){
        if (x<0){
            return 0;
        }else if(x==0){
            return 0.5;
        }else {
            return 1;
        }
    }
    var distance_touying;
    var interference_sBS_gBS = [];
    for (var k=0;k<number_BS;k++){
        angle=(90-Math.atan(Math.abs(coordinate_sBS[0][k]/coordinate_sBS[1][k]))/Math.PI*180)*heaviside(coordinate_sBS[1][k])+(90+Math.atan(Math.abs(coordinate_sBS[0][k]/coordinate_sBS[1][k]))/Math.PI*180)*heaviside(-coordinate_sBS[1][k]);
        angle1[0][k] = Math.abs(angle-60)*heaviside(120-angle)+(180-angle)*heaviside(angle-120);
        differ_height[k] = Math.abs(height_gBS[k]-height_sBS[k]);
        distance_touying = Math.sqrt(Math.pow(coordinate_sBS[0][k],2)+Math.pow(coordinate_sBS[1][k],2)*Math.cos(angle1[0][k]*Math.PI/180));
        angle2[0][k] = Math.atan(differ_height[k]/distance_touying)/Math.PI*180-input[k][3];
        
        //var coordinate_gBS = -coordinate_sBS;
        //coordinate_gBS = coordinate_sBS.map(function (item,i) { return (-1)*coordinate_sBS


        angle=(90-Math.atan(Math.abs(-coordinate_sBS[0][k]/(-coordinate_sBS[1][k]))/Math.PI*180))*heaviside(-coordinate_sBS[1][k])+(90+Math.atan(Math.abs(coordinate_sBS[0][k]/coordinate_sBS[1][k]))/Math.PI*180)*heaviside(coordinate_sBS[1][k]);//因为注释把两个负号提出来了
        angle1[1][k] = Math.abs(angle -60)*heaviside(120-angle)+(180-angle)*heaviside(angle-120);
        distance_touying = Math.sqrt(Math.pow(-coordinate_sBS[0][k],2)+Math.pow(-coordinate_sBS[1][k],2))*Math.cos(angle1[1][k]*Math.PI/180);
        angle2[1][k] = Math.atan(differ_height[k]/distance_touying)/Math.PI*180-input[k][11];


        C[0][k]=-12*Math.pow(angle1[0][k]/ceter3db,2);
        C1[0][k]=-12*Math.pow(angle2[0][k]/ceter3db,2);
        C[1][k]=-12*Math.pow(angle1[1][k]/ceter3db,2);
        C1[0][k]=-12*Math.pow(angle2[0][k]/ceter3db,2);
        if (isNaN(C[0][k])==1){
            C[0][k] = 0 ;
        }
        if (isNaN(C[1][k])==1){
            C[1][k] = 0 ;
        }
        if (isNaN(C1[0][k])==1){
            C1[0][k] = 0 ;
        }
        if (isNaN(C1[1][k])==1){
            C1[1][k] = 0 ;
        }

        //C(find(isnan(C)==1)) = 0;
        //C1=-12*((angle2)./ceter3db).^2;
        //C1(find(isnan(C1)==1)) = 0;
        gain_gBS_sBS0[0][k] = 15-Math.min(-(C[0][k]+C1[0][k]),D[0][k]);
        gain_gBS_sBS0[1][k] = 15-Math.min(-(C[1][k]+C1[1][k]),D[1][k]);
        gain_gBS_sBS[0][k] = Math.pow(10,gain_gBS_sBS0[0][k]/10);
        gain_gBS_sBS[1][k] = Math.pow(10,gain_gBS_sBS0[1][k]/10);
        interference_sBS_gBS[k] = (power_gBS[k]*gain_gBS_sBS[0][k]*gain_gBS_sBS[1][k])/pathLoss_sBS_gBS[k]/Math.max.apply(Math,ACLR);  
        //gain_gBS_sBS0=15-min(-(C+C1),D);
        //gain_gBS_sBS=10.^(gain_gBS_sBS0./10);
    }
    //coordinate_sUE=zeros(number_sBS,3*number_User,3);  
    D = null;
    C = null ;
    angle1 = null;
    angle2 = null;
    D = [];
    angle1 = [];
    C = []; 
    angle2 = [];
    var coordinate_sUE0 = [];  
    var coordinate_sUE1 = [];  
    var coordinate_sUE2 = [];  
    for (var i=0;i<3*number_User;i++ ){  //180列
        coordinate_sUE0[i] = [];  
        coordinate_sUE1[i] = []; 
        coordinate_sUE2[i] = []; 
        D[i] = [];
        C[i] = []; 
        angle1[i] = [];
        angle2[i] = [];
    }  
    for (var j=0;j<3*number_User;j++){
        for (var i=0;i<number_BS;i++){     //57行
            coordinate_sUE0[j][i] = 0;
            coordinate_sUE1[j][i] = 0;
            coordinate_sUE2[j][i] =0;
            D[j][i] = 20;
        }
    }
    var x = [];
    for (var i = 0 ;i<number_BS;i++){

        var k=0;
        while (k < number_User*3){
            x=[(Math.sqrt(3)/2)*(2*Math.random()-1)*r,(2*Math.random()-1)*r];
            if ((Math.abs(x[1])+Math.abs(x[0])/Math.sqrt(3))<r){
              
                coordinate_sUE0[k][i] = x[0];
                coordinate_sUE1[k][i] = x[1];
                coordinate_sUE2[k][i] = Math.sqrt(Math.pow(x[0],2)+Math.pow(x[1],2)+Math.pow(height_sBS[i]-height_sUE,2));
                k = k + 1;
            }   
        }
    }
    var ceter3db=65;    
    for (var k = 0;k< number_BS;k++){
        for (var i = 0 ;i< number_User*3;i++){
            angle = (90-Math.atan(Math.abs(coordinate_sUE0[i][k]/coordinate_sUE1[i][k]))/Math.PI*180)*heaviside(coordinate_sUE1[i][k])+(90+Math.atan(Math.abs(coordinate_sUE0[0][k]/coordinate_sUE1[i][k]))/Math.PI*180)*heaviside(-coordinate_sUE1[i][k]);
            //angle = (90-atan(abs(coordinate_sUE(k,i,1)/coordinate_sUE(k,i,2)))/pi*180)*heaviside(coordinate_sUE(k,i,2))+(90+atan(abs(coordinate_sUE(k,i,1)/coordinate_sUE(k,i,2)))/pi*180)*heaviside(-coordinate_sUE(k,i,2));
            //  %angle = abs(atan(coordinate_sUE(k,i,1)/coordinate_sUE(k,i,2)))/pi*180;  %终端与正北方向的夹角
            angle1[i][k] = Math.abs(angle-60)*heaviside(120-angle)+(180-angle)*heaviside(angle-120);
            //angle1(k,i) = abs(angle -60).*heaviside(120-angle)+(180-angle).*heaviside(angle-120);%基站和终端连线与天线水平方向的夹角
            differ_height[k] = Math.abs(height_sBS[k]-height_sUE);
            distance_touying = Math.sqrt(Math.pow(coordinate_sUE0[i][k],2)+Math.pow(coordinate_sUE1[i][k],2)*Math.cos(angle1[i][k]*Math.PI/180));
            // distance_touying = sqrt(coordinate_sUE(k,i,1).^2.+coordinate_sUE(k,i,2).^2)*cos(deg2rad(angle1(k,i)));%计算余弦值时，角度需转换为弧度
            angle2[i][k] = Math.atan(differ_height[k]/distance_touying)/Math.PI*180-input[k][3];
            //angle2(k,i) = atan(differ_height(k)./distance_touying)/pi*180-tilt_down(k,1);%基站和终端连线与天线垂直方向的夹角
        }
        //console.log(angle1)
    }

    C1 = null;
    pathLoss_sBS_gBS = null;

    C1=[];  
    var gain_sBS_sUE0 = [];
    var gain_sBS_sUE = [];
    pathLoss_sBS_gBS = [];
    var pathLoss_sUE_sBS = [];
    var interference_sUE_sBS_Count = [];
    var interference_sUE_sBS = [];

    // C = buildamir(C,D);
    // C1 = buildamir(C1,angle1);
    // gain_sBS_sUE0 = buildamir( gain_sBS_sUE0,angle1);
    // gain_sBS_sUE  = buildamir( gain_sBS_sUE,angle1);
    for (var i=0;i<3*number_User;i++){  
        C1[i]=[];   
        gain_sBS_sUE0[i] = [];  
        gain_sBS_sUE[i] = [];
        pathLoss_sBS_gBS[i] = [];
        interference_sUE_sBS_Count[i] = [];
        interference_sUE_sBS[i] = [];
        pathLoss_sUE_sBS[i] = [];
    }  

    for (var i=0;i<number_User*3 ;i++ ){     
        for (var j=0;j<number_BS ;j++ ){  
            C[i][j]=-12*Math.pow(angle1[i][j]/ceter3db,2); 
            C1[i][j]=-12*Math.pow((angle2[i][j])/ceter3db,2); 
        }  
    }  

    function findnan(arr){
        for (var i=0;i<arr.length ;i++ ){//控制有几个元素  
            for (var j=0;j<arr[i].length ;j++ ){ //遍历每一个具体的值  
                if(isNaN(arr[i][j])==1){
                    arr[i][j] = 0
                }
            }  
        }  
        return arr
    } 
    C = findnan(C);
    C1 = findnan(C1);
    //console.log(C);
    //pathLoss_sBS_gBS  = buildamir( pathLoss_sBS_gBS,angle1);
    // var interference_sUE_sBS = [];
    // interference_sUE_sBS = buildamir( interference_sUE_sBS,angle1);
    for (var i=0;i<number_User*3;i++ ){//控制有几个元素  
        for (var j=0;j<number_BS;j++ ){//遍历每一个具体的值  
            gain_sBS_sUE0[i][j] = 15-Math.min(-(C[i][j]+C1[i][j]),D[i][j]);
            gain_sBS_sUE[i][j] = Math.pow(10,gain_sBS_sUE0[i][j]/10);
            pathLoss_sUE_sBS[i][j] = Math.pow(10,(92.5+20*Math.log(f)/Math.log(10)+20*Math.log(coordinate_sUE2[i][j])/Math.log(10)+(0.0072+0.0012)*coordinate_sUE2[i][j]+wallthrowLoss)/10);
            interference_sUE_sBS[i][j] = (power_UE_Max*gain_sUE*gain_sBS_sUE[i][j])/pathLoss_sUE_sBS[i][j];
            //    console.log(interference_sUE_sBS[i][j]);
            //   console.log( gain_sBS_sUE[i][j]);
            //   console.log(pathLoss_sUE_sBS[i][j]);
        }  
    } 
    interference_sUE_sBS =  findnan(interference_sUE_sBS);
    // interference_sBS_gBS[i] = interference_sBS_gBS

    // Mir = interference_sBS_gBS;
    // interference_sBS_gBS = null;
    // interference_sBS_gBS = [];
    var Mir = [];
    for (var i=0;i<number_User*3;i++){
        Mir.push(interference_sBS_gBS.concat());
    }
    // var interference_sUE_sBS_Count = [];
    // interference_sUE_sBS_Count = buildamir( interference_sUE_sBS_Count,angle1);

    for (var k = 0;k< number_BS;k++){
        for (var i = 0 ;i< number_User*3;i++) {
            if (interference_sUE_sBS[i][k]<Mir[i][k]){  
              interference_sUE_sBS_Count[i][k] = 1;
            }else {
                interference_sUE_sBS_Count[i][k] = 0;
            }  
         }
     }
    var sum = [];

    var  probability_sUE = [];
    for (var k = 0;k< number_BS;k++){
        sum[k]=0;
        for (var i = 0 ;i< number_User*3;i++) {
            sum[k] += interference_sUE_sBS_Count[i][k];
        }
        rData[k]['干扰系数'] = sum[k]/(number_User*3);
    }
    //console.log(probability_sUE)
    return rData;
}

//热力图
function hotMap(data){
    var rData = data.station1;
    var data2 = data.station2;
    var number_BS = rData.length;
    var props=['站高(m)','DownTilt(度)','Azimuth(度)','载波频点(MHz)','基站发射功率(dBm)'];
    var input = [];
    for(var i=0,length1=rData.length;i<length1;i++){   
        var temp = [];
        temp.push(rData[i][0],rData[i][1]);
        for(var j=0,length2=data2[i].length;j<length2;j++){
            temp.push(data2[i][j].geom.coordinates[0],data2[i][j].geom.coordinates[1]);
            for(var k=0;k<props.length;k++){
                temp.push(data2[i][j][props[k]]);
            }
        }
        input.push(temp.concat()); 
    } 
    var coordinate_sBS00 = [];
    var coordinate_sBS01 = [];
    var coordinate_gBS00 = [];
    var coordinate_gBS01 = [];
    var coordinate_sBSS0 = [];
    var coordinate_sBSS1 = [];
    
    for (var i=0;i<number_BS;i++){
        coordinate_sBS00[i] = input[i][0];
        coordinate_sBS01[i] = input[i][1];
        coordinate_gBS00[i] = input[i][2];
        coordinate_gBS01[i] = input[i][3];
        coordinate_sBSS0[i] = (coordinate_gBS00[i] - coordinate_sBS00[i])*111*Math.cos(coordinate_gBS01[i]); 
        coordinate_sBSS1[i] = (coordinate_gBS01[i] - coordinate_sBS01[i])*111;          
    }
    var coordinate_sBS0 = [coordinate_sBS00,coordinate_sBS01];
    var coordinate_gBS0 = [coordinate_gBS00,coordinate_gBS01];
    var coordinate_sBS = [coordinate_sBSS0,coordinate_sBSS1];
    //console.log(coordinate_sBS);
    var f = 2.5,wallthrowLoss = 0;

    //console.log(input[0][8]);
    var power_gBS = input.map(function (item,i) { return Math.pow(10,input[i][8]/10)});
    var height_BS = input.map(function (item,i) {return input[i][4]/1000});
    var distance_sBS_gBS = input.map(function (item,i) {
        return 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][3]*Math.PI/180)+Math.cos((input[i][2]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][3]*Math.PI/180));
    });
    //console.log(distance_sBS_gBS)
    //pathLoss_sBS_gBS=10.^((80+21*log10(f)+40*log10(distance_sBS_gBS/1000).*(1-4*10^(-3).*height_BS*1000)-18*log10(height_BS*1000))./10);
    var pathLoss_sBS_gBS = height_BS.map(function (item,i) {
        return Math.pow(10,(80+21*Math.log(f)/Math.log(10)+40*Math.log(distance_sBS_gBS[i]/1000)/Math.log(10)*(1-4*Math.pow(10,-3)*height_BS[i]*1000)-18*Math.log(height_BS[i]*1000)/Math.log(10))/10)
    });
    var ceter3db=65;                
    var Am=20;                      
    var D = [];
    var cosgg = [];
    for (var i=0;i<number_BS;i++){
        D.push(20);
        cosgg.push(1);
    }
    var cosgg1 = cosgg.concat();
    var cosgg2 = cosgg.concat();
    var tilt_down_Radian = input.map(function (item,i) {return input[i][5]*Math.PI/180});
    var tilt_direct_Radian = input.map(function (item,i) {return input[i][6]*Math.PI/180});

    var r,B,A1,F,M,aa,a,tilt,l;
    var R,linshi,b,F;
    for (var k=0;k<number_BS;k++){
        distance_sBS_gBS = Math.sqrt(Math.pow(coordinate_sBS[0][k],2)+Math.pow(coordinate_sBS[0][k],2));     
        r = 1.5 * distance_sBS_gBS;
        B = [coordinate_sBS[0][k],coordinate_sBS[1][k],height_BS[k]];
        if ((B[1]/Math.sqrt(3))<B[0]&&(B[1]/Math.sqrt(3))>-B[0]) {
            A1=[(-1/2)*r,(1/2)*Math.sqrt(3)*r,0];
        }else if (B[1]>0){
            A1=[(-1/2)*r,(-1/2)*Math.sqrt(3)*r,0];
        }else{ 
            A1=[Math.sqrt(3)*r,0,0];
        }       
        F = height_BS.map(function (item,i) { return height_BS[i]-r*Math.tan(tilt_down_Radian[k])});
        M=[0,0,F[k]];
        aa=[0,0,height_BS[k]];  
        var a = aa.map(function (item,i) {
            return aa[i]-B[i];
        });
        tilt = tilt_direct_Radian[k];
        R = [[Math.cos(tilt),-Math.sin(tilt),0],[Math.sin(tilt),Math.cos(tilt),0],[0,0,1]];

        function T(arr){
            var arr_new=[];  
            //初始化，定下有多少行  
            for (var i=0;i<arr[0].length;i++ ){  
                arr_new[i]=[];  
            }  
            //可以动态的添加数据  
            //遍历旧数组  
            for (var i=0;i<arr.length ;i++ ){//控制有几个元素     
                for (j=0;j<arr[i].length ;j++ ){//遍历每一个具体的值   
                    arr_new[j][i]=arr[i][j];  
                }  
            }  
            return arr_new;
        }

        // a = a * R;
     
        var a_new = [];
        for (var i=0;i<a.length;i++ ){
            //R_col = T(R)[i]
            //console.log(i+"1");
            //console.log(R_col)
            a_new[i] = dot(a,T(R)[i]);
            // console.log(i);
        }
        a = a_new

        function dot(v1,v2) {  
            var res = 0;
            for (var j=0;j<v1.length;j++){
                res += v1[j]*v2[j];
            }
            return res;
        }   
        //console.log(dot(a,T(R)[1]))

        linshi = [A1[0],A1[1],height_BS[k]];
        b = M.map(function (item,i) {
            return M[i]-linshi[i];
        })
       // b=M-[A1(1),A1(2),height_BS(k)];


        function X2(X){
            cf = X.map(function (item,i) {
                return X[i]*X[i];
            });
            return cf;
        }
        function sum(list){
            return eval(list.join("+"));
        }
        function norm(v){
            return Math.sqrt(sum(X2(v)));
        }

        cosgg[k] = Math.abs(dot(a,b))/(norm(a)*norm(b));   

        var fxxl = [0,0,-1] //方向向量
        var n1 = A1.map(function (item,i) {
            return A1[i]/norm(A1)*Math.sin(tilt_down_Radian[k])+fxxl[i]/norm(fxxl)*Math.cos(tilt_down_Radian[k]);
        })

        var d1 = Math.abs(dot(a,n1))/norm(n1);
        cosgg1[k]=Math.sqrt(1-Math.pow((d1/norm(a)),2));                        
        var n2 = [A1[0]+A1[1],A1[1]-A1[0],0];                                 
        var d2 = Math.abs(dot(a,n2))/norm(n2);
        cosgg2[k] = Math.sqrt(1-Math.pow(d2/norm(a),2));                           
    }
    //console.log(n2)
    //console.log(cosgg2)
    //以上调试完成校对结果准确

    var g1=[];g2=[];
    var gain_gBS_sBS0=[];
    var gain_gBS_sBS=[],C=[],C1=[],power_re=[],g11=[],g21=[],power_re=[];
    for (var i=0;i<number_BS;i++){
        g1[i] = cosgg[i]/cosgg1[i];
        g2[i] = cosgg[i]/cosgg2[i];
        //var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
        if (isNaN(g1[i])==1){
            g1[i] = 0 ;
        }
        if (isNaN(g2[i])==1){
            g2[i] = 0 ;
        }
        g11[i] = Math.acos(g1[i])*180/Math.PI;    //js real 不知道如何处理
        g21[i] = Math.acos(g2[i])*180/Math.PI;
        C[i] = -12*(Math.pow((g11[i])/ceter3db,2));
        if (isNaN(C[i])==1){
            C[i] = 0 ;
        }
        //C(find(isnan(C)==1)) = 0;
        //C1=-12*((g21)./ceter3db).^2;
        C1[i] = -12*(Math.pow((g21[i])/ceter3db,2));
        if (isNaN(C1[i])==1){
            C1[i] = 0 ;
        }
        gain_gBS_sBS0[i] = 15-Math.min(-(C[i]+C1[i]),D[i]);
        gain_gBS_sBS[i] = Math.pow(10,gain_gBS_sBS0[i]/10);

        power_re[i]=(power_gBS[i]*gain_gBS_sBS[i])/pathLoss_sBS_gBS[i];    
        rData[i].push(10*Math.log(power_re[i])/Math.log(10)-20*Math.log(f)/Math.log(10)-75.06); 
    }
    return rData;
}

//网络布局
function layout(data){
    var rData = data.station1;
    var data2 = data.station2;
    var number_BS = rData.length;
    var input = [];
    for(var i=0,length1=rData.length;i<length1;i++){   
        var temp = [];
        temp.push(rData[i].geom.coordinates[0],rData[i].geom.coordinates[1],rData[i]['站高(m)']);
        for(var j=0,length2=data2[i].length;j<length2;j++){
            temp.push(data2[i][j].geom.coordinates[0],data2[i][j].geom.coordinates[1]);
        }
        input.push(temp.concat()); 
    }
    // Bstation = new Object()
    //console.log(input[0]);
    var result = [];

    var height_BS = [];
    for (i=0;i<number_BS;i++){
      height_BS[i] = input[i][2];    //height_BS = input(:,3); 
      //height_BS.push(input[i][2])
    }

    var height_BS_mean = eval(height_BS.join("+"))/number_BS;

    // for(i=0;i<height_BS.length;i++){
    // result3[i] = (height_BS[i] < height_BS_mean*0.85) | (height_BS[i] > height_BS_mean*1.15)
    // result1[i] = distance7[i]/2; 
    // } //result(:,3)
    var distance1 = [];
    var distance2 = [];
    var distance3 = [];
    var distance4 = [];
    var distance5 = [];
    var distance6 = [];
    var distance7 = [];
    var arr = [];

    for (i=0;i<number_BS;i++){
        arr.push(0);
    }

    for (i=0;i<15;i++){
        result.push(arr.concat());
    }
    //console.log(result)
    for (i=0;i<number_BS;i++){
        distance1[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][4]*Math.PI/180)+Math.cos((input[i][3]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][4]*Math.PI/180));
        //{distance1[i] = Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][4]*Math.PI/180)
        distance2[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][6]*Math.PI/180)+Math.cos((input[i][5]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][6]*Math.PI/180)); 
        distance3[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][8]*Math.PI/180)+Math.cos((input[i][7]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][8]*Math.PI/180)); 
        distance4[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][10]*Math.PI/180)+Math.cos((input[i][9]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][10]*Math.PI/180)); 
        distance5[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][12]*Math.PI/180)+Math.cos((input[i][11]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][12]*Math.PI/180)); 
        distance6[i] = 6371004*Math.acos(Math.sin(input[i][1]*Math.PI/180)*Math.sin(input[i][14]*Math.PI/180)+Math.cos((input[i][13]-input[i][0])*Math.PI/180)*Math.cos(input[i][1]*Math.PI/180)*Math.cos(input[i][14]*Math.PI/180)); 
        distance7[i] =(distance1[i]+distance2[i]+distance3[i]+distance4[i]+distance5[i]+distance6[i])/6;
        //console.log(input[i][1])
    }
    for(i=0;i<height_BS.length;i++){
    result[2][i] = (height_BS[i] < height_BS_mean*0.85) | (height_BS[i] > height_BS_mean*1.15);
    result[0][i] = distance7[i]/2; 

    } 
    //console.log(result)
    //console.log(distance7)


    var distance = [distance1,distance2,distance3,distance4,distance5,distance6,distance7];
    var flag = [];
    var postion = new Array();
    for (i=0;i<=number_BS;i++){
        postion.push(1)
    };
    for (i=1;i<=6;i++){
        for (k=0;k<number_BS;k++){
            flag[k] = (distance[i-1][k] < distance[6][k]*0.75) | (distance[i-1][k] > distance[6][k]*1.25);  
            result[1][k] = result[1][k] | flag[k];      
            result[2*postion[k]+1][k] = input[k][2*i+1]*flag[k];     //result 原文中用position表示，这里直接编号，之后出错的话再改
            result[2*postion[k]+2][k] = input[k][2*i+2]*flag[k];
        }
        for (j=0;j<number_BS;j++){
            postion[j] = postion[j] + flag[j];                                          
        }
    }
    //console.log(result[0]);
    for (i=0;i<result[0].length;i++){
        rData[i]['小区半径'] = result[0][i];
        rData[i]['基站布局'] = result[1][i];
        rData[i]['基站站高'] = result[2][i];
        rData[i]['rePoints'] = [];
        for (j=3;j<result.length;j++){  
            rData[i]['rePoints'].push(result[j][i]);
        }
    }
    return rData;
}
module.exports={
    rate:rate,
    interference:interference,
    hotMap:hotMap,
    layout:layout,
}