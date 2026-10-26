// Browser-local snapshots; hash links detect accidental changes, not tamper-proof authentication.
export const STORE_KEY = "verdict-ledger-public-v1";
export const MAX_ENTRIES=100;
export const MAX_HASHES=6;
export const HASH_RX=/^0x[0-9a-f]{64}$/;
export function parseHashes(text) {
  const words=String(text).trim().split(/[\s,]+/).filter(Boolean).map(x=>x.toLowerCase());
  if(words.length===0||words.length>MAX_HASHES)throw Error("Enter 1–6 transaction hashes.");
  if(words.some(x=>!HASH_RX.test(x)))throw Error("Each hash must be 0x plus 64 hexadecimal characters.");
  return [...new Set(words)];
}
export async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
}
export async function verify(entries){
  if(!Array.isArray(entries)||entries.length>MAX_ENTRIES)throw Error("Invalid history length");
  let prev="GENESIS";
  for(let i=0;i<entries.length;i++){
    const e=entries[i];
    if(!e||e.sequence!==i+1||e.prev!==prev||typeof e.at!=="string"||!Array.isArray(e.results)||e.results.length<1||e.results.length>MAX_HASHES)throw Error("History sequence/link mismatch at "+(i+1));
    if(e.results.some(x=>!x||!HASH_RX.test(x.hash)||!(x.status===null||typeof x.status==="string")||!(x.error===null||typeof x.error==="string")))throw Error("Invalid result at "+(i+1));
    const expected=await sha256(JSON.stringify({sequence:e.sequence,prev:e.prev,at:e.at,results:e.results}));
    if(e.digest!==expected)throw Error("History digest mismatch at "+(i+1));
    prev=e.digest;
  }
  return true;
}
export async function addObservation(entries,results,at=new Date().toISOString()){
  await verify(entries);
  if(entries.length>=MAX_ENTRIES)throw Error("History full; export before reset.");
  if(!Array.isArray(results)||results.length<1||results.length>MAX_HASHES)throw Error("Invalid result batch");
  const entry={sequence:entries.length+1,prev:entries.at(-1)?.digest??"GENESIS",at,results};
  entry.digest=await sha256(JSON.stringify(entry));
  const next=[...entries,entry];
  await verify(next);
  return next;
}
export function summarize(entries){
  const byHash=new Map();
  for(const entry of entries)for(const result of entry.results){
    let record=byHash.get(result.hash);
    if(!record){record={hash:result.hash,latest:null,changes:0,errors:0,observations:0,events:[]};byHash.set(result.hash,record);}
    record.observations++;
    if(result.error)record.errors++;
    if(result.status!==null){
      if(record.latest!==null&&record.latest!==result.status)record.changes++;
      record.latest=result.status;
    }
    record.events.push({at:entry.at,sequence:entry.sequence,status:result.status,error:result.error});
  }
  return {schema:"genlayer-verdict-public/1",chain:"GenLayer Studionet",rpc:"gen_getTransactionStatus",capturedAt:new Date().toISOString(),entries:entries.length,lastDigest:entries.at(-1)?.digest??null,transactions:[...byHash.values()],snapshots:entries,
    limitations:"User-controlled browser-local SHA-256 journal only; not an independent validator attestation. Consensus status is not contract execution success. Missing intermediate transitions cannot be inferred."};
}
