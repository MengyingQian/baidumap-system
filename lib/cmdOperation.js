'use strict'

var cp = require('child_process');
function run(){
    cp.exec('e:/mongodb/bin/mongod.exe --dbpath e:/mongodb/data', function(e, stdout, stderr) {
    　　if(!e) {
    　　　　console.log(stdout);
    　　　　console.log(stderr);
    　　}
    });
}

module.exports = {
    startDB : run
};