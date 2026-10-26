import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHashes, audit } from "../ledger.mjs";
const h="0x"+"a".repeat(64);
test("requires valid hashes and deduplicates",()=>{
 assert.deepEqual(parseHashes([h,h.toUpperCase().replace("0X","0x")]),[h]);
 assert.throws(()=>parseHashes(["abc"]));
 assert.throws(()=>parseHashes(Array(13).fill(h)));
});
test("real status is not interpreted as success",async()=>{
 const fetcher=async()=>({ok:true,json:async()=>({jsonrpc:"2.0",result:"FINALIZED"})});
 const report=await audit([h],fetcher);
 assert.equal(report.results[0].status,"FINALIZED");
 assert.match(report.limitations,/does NOT prove execution success/);
 assert.equal(report.method,"gen_getTransactionStatus");
});
test("RPC errors remain visible",async()=>{
 const fetcher=async()=>({ok:true,json:async()=>({error:{message:"rate limit"}})});
 const report=await audit([h],fetcher);
 assert.equal(report.results[0].status,null);
 assert.match(report.results[0].error,/rate limit/);
});
