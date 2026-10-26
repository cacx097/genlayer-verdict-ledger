import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import path from "node:path";
import {audit} from "../ledger.mjs";
import {appendObservation,loadHistory,summarize} from "../history.mjs";
const hash="0x"+"e".repeat(64);
const mock=status=>async()=>({ok:true,json:async()=>({jsonrpc:"2.0",id:1,result:status})});
test("time-stamped observation history, status changes and verification",async()=>{
  const dir=await mkdtemp(path.join(import.meta.dirname,".tmp-verdict-"));
  try{
    const file=path.join(dir,"observations.jsonl");
    const first=await appendObservation(file,await audit([hash],mock("PENDING")));
    const second=await appendObservation(file,await audit([hash],mock("FINALIZED")));
    assert.equal(first.sequence,1);
    assert.equal(second.previousDigest,first.digest);
    const items=await loadHistory(file);
    const summary=summarize(items);
    assert.equal(summary.transactions[0].changes,1);
    assert.equal(summary.transactions[0].latestObservedStatus,"FINALIZED");
    assert.equal(summary.lastDigest,second.digest);
    const content=await readFile(file,"utf8");
    await writeFile(file,content.replace('"status":"PENDING"','"status":"ACCEPTED"'));
    await assert.rejects(loadHistory(file),/Digest mismatch/);
    await assert.rejects(appendObservation(file,await audit([hash],mock("FINALIZED"))),/Digest mismatch/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test("error observation never becomes a successful consensus outcome",async()=>{
  const dir=await mkdtemp(path.join(import.meta.dirname,".tmp-verdict-"));
  try{
    const file=path.join(dir,"history.jsonl");
    const err=async()=>({ok:true,json:async()=>({error:{code:429,message:"rate limited"}})});
    await appendObservation(file,await audit([hash],err));
    const s=summarize(await loadHistory(file));
    assert.equal(s.transactions[0].latestObservedStatus,null);
    assert.equal(s.transactions[0].errors,1);
    assert.match(s.caveats[2],/does not prove/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
