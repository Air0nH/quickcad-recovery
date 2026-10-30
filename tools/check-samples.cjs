const fs=require('node:fs'),path=require('node:path'),load=require('./load-decoder.cjs');
const dir=process.argv[2];if(!dir){console.error('Usage: node tools/check-samples.cjs path/to/samples');process.exit(2)}
const {decodeCAD}=load(),rows=[];
for(const name of fs.readdirSync(dir).filter(n=>/\.(cad|skf|skd)$/i.test(n)).sort()){
 const b=fs.readFileSync(path.join(dir,name));try{const m=decodeCAD(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));rows.push({name,status:m.empty?'empty':'decoded',topLevel:m.topLevelCount,stats:m.stats,issues:m.issues})}catch(e){rows.push({name,status:'rejected',error:e.message})}
}
console.log(JSON.stringify(rows,null,2));
