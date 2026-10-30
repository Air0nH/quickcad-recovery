const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
module.exports=function load(file=path.join(__dirname,'../index.html')){
 const html=fs.readFileSync(file,'utf8'),match=html.match(/<script>([\s\S]*?)<\/script>/);
 if(!match)throw Error('Decoder script not found');
 const c={module:{exports:{}},TextDecoder,TextEncoder};vm.createContext(c);vm.runInContext(match[1],c,{timeout:5000});return c.module.exports;
};
