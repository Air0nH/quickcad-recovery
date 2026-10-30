// Read-only structural inspector. It does not interpret every file-format field.
const fs=require('node:fs'),crypto=require('node:crypto');
const filename=process.argv[2];if(!filename){console.error('Usage: node tools/inspect.cjs drawing.cad');process.exit(2)}
const b=fs.readFileSync(filename),u=p=>{if(p<0||p+4>b.length)throw Error('Truncated integer');return b.readUInt32LE(p)};
function str(p){if(p>=b.length)throw Error('Truncated string');let n=b[p++];if(n===255){n=u(p);p+=4}if(p+n>b.length)throw Error('Truncated string');return [b.subarray(p,p+n).toString('latin1'),p+n]}
const out={bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),prefixHex:b.subarray(0,14).toString('hex'),sections:{}};
try{let [id,p]=str(6);let [release]=str(p);out.header={id,release};}catch(e){out.headerError=e.message}
for(const name of ['Drawing Variables','Symbol Definitions','Entity List'])out.sections[name]=b.indexOf(Buffer.concat([Buffer.from([name.length]),Buffer.from(name)]));
const main=out.sections['Entity List'];
try{if(main<0)throw Error('Entity List absent');let [list,p]=str(main+12);p+=4;const n=u(p);p+=4;out.list={name:list,count:n,start:p,records:[]};if(n>200000)throw Error('Too many records');for(let i=0;i<n;i++){const type=u(p),length=u(p+4);if(length<4||p+8+length>b.length)throw Error('Invalid record length');out.list.records.push({index:i,offset:p,body:p+8,type,length,end:p+8+length});p+=8+length}out.list.end=p;}catch(e){out.listError=e.message}
console.log(JSON.stringify(out,null,2));
