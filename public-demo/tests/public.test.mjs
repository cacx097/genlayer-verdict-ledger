import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {webcrypto} from "node:crypto";
import {pathToFileURL} from "node:url";
import {onRequestPost,onRequestGet} from "../functions/api/status.js";
globalThis.crypto ??= webcrypto;
const core=await import(pathToFileURL(new URL("../public/history-core.js",import.meta.url).pathname).href).catch(async()=>import("../public/history-core.js"));
const hash="0x"+"a".repeat(64);
test("public local history, change detection and tampering",async()=>{
 const a=await core.addObservation([],[{hash,status:"PENDING",error:null}]);
 const b=await core.addObservation(a,[{hash,status:"FINALIZED",error:null}]);
 assert.equal(core.summarize(b).transactions[0].changes,1);
 await core.verify(b);
 const bad=structuredClone(b);bad[0].results[0].status="ACCEPTED";
 await assert.rejects(core.verify(bad),/digest mismatch/);
 assert.throws(()=>core.parseHashes("bad"),/64 hexadecimal/);
});
test("relay rejects invalid, cross-origin and GET without network",async()=>{
 const origin="https://example.pages.dev";
 const fetchCase=(body,headers={})=>onRequestPost({request:new Request(origin+"/api/status",{method:"POST",headers:{"origin":origin,"content-type":"application/json",...headers},body:JSON.stringify(body)})});
 assert.equal((await fetchCase({hashes:["x"]})).status,400);
 assert.equal((await fetchCase({hashes:[hash]},{"origin":"https://not-us.pages.dev"})).status,403);
 assert.equal((await onRequestGet()).status,405);
});
test("relay only sends fixed read-only RPC method and retains upstream status",async()=>{
 const old=globalThis.fetch;
 try{
  globalThis.fetch=async(uri,opts)=>{
    assert.equal(uri,"https://studio.genlayer.com/api");
    const body=JSON.parse(opts.body);
    assert.equal(body.method,"gen_getTransactionStatus");
    assert.deepEqual(body.params,[hash]);
    return {ok:true,json:async()=>({jsonrpc:"2.0",id:1,result:"FINALIZED"})};
  };
  const r=await onRequestPost({request:new Request("https://example.pages.dev/api/status",{method:"POST",headers:{"origin":"https://example.pages.dev","content-type":"application/json"},body:JSON.stringify({hashes:[hash]})})});
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(data.results[0].status,"FINALIZED");
 }finally{globalThis.fetch=old;}
});

[executed on device: DESKTOP-AREG5VQ (40ecba05-344f-45d1-95f3-373701c9d19b)]
