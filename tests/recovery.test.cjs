const test=require('node:test'),assert=require('node:assert/strict');
const {decodeCAD,makeSVG}=require('../tools/load-decoder.cjs')();
// Synthetic fixtures exercise implementation contracts, not native format validity.
const u=n=>{const b=Buffer.alloc(4);b.writeUInt32LE(n);return b};
const str=s=>Buffer.concat([Buffer.from([Buffer.byteLength(s)]),Buffer.from(s)]);
function fixture(records=[]){return Buffer.concat([Buffer.from([10,0,0,0,0,11]),str('412'),str('7.0'),Buffer.alloc(100),str('Entity List'),str('Main'),u(0),u(records.length),...records])}
const ab=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
test('empty drawing without symbol definitions is identified; SVG export is unavailable',()=>{const m=decodeCAD(ab(fixture()));assert.equal(m.empty,true);assert.equal(m.topLevelCount,0);assert.equal(m.bounds,null);assert.throws(()=>makeSVG(m),/nonempty layer/)});
test('nonempty unsupported drawing is not called empty',()=>{const b=fixture([Buffer.concat([u(999),u(6),u(0),str('0')])]);assert.throws(()=>decodeCAD(ab(b)),/contains records/)});
test('truncated entity body fails structurally',()=>{assert.throws(()=>decodeCAD(ab(fixture([Buffer.concat([u(1),u(200),u(0)])]))),/Invalid object length/)});
test('missing entity section has a specific error',()=>{const b=fixture();b[b.indexOf('Entity List')]=88;assert.throws(()=>decodeCAD(ab(b)),/Entity List/)});
test('unsupported release is still rejected',()=>{const b=fixture();b[11]=57;assert.throws(()=>decodeCAD(ab(b)),/Unsupported header/)});
test('missing extended string length is rejected',()=>{const b=fixture();b[b.indexOf('Main')-1]=255;const short=b.subarray(0,b.indexOf('Main')+1);assert.throws(()=>decodeCAD(ab(short)),/Truncated string length/)});
