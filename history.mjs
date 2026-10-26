import { createHash } from "node:crypto";
import { appendFile, open, readFile, stat, unlink } from "node:fs/promises";
import { parseHashes } from "./ledger.mjs";

const SCHEMA="verdict-ledger-observation/1";
const GENESIS="GENESIS";
const MAX_BYTES=2_000_000;
const MAX_RECORDS=500;
const sha=x=>createHash("sha256").update(x).digest("hex");
const digestFor=({digest,...rest})=>sha(JSON.stringify(rest));

export async function loadHistory(file) {
  let size;
  try {size=(await stat(file)).size;} catch(e) {if(e.code==="ENOENT")return [];throw e;}
  if(size>MAX_BYTES)throw Error("Log exceeds size limit; archive and start a new log");
  const content=await readFile(file,"utf8");
  if(!content)return [];
  if(!content.endsWith("\n"))throw Error("Log has an incomplete last line; no automatic repair");
  const lines=content.trimEnd().split("\n");
  if(lines.length>MAX_RECORDS)throw Error("Too many log entries");
  const records=[];
  for(const [i,line] of lines.entries()){
    let row;
    try {row=JSON.parse(line);} catch {throw Error("Invalid JSON at line "+(i+1));}
    if(!row||Array.isArray(row)||row.schema!==SCHEMA||row.sequence!==i+1)throw Error("Invalid record or sequence at line "+(i+1));
    if(row.previousDigest!==(i?records[i-1].digest:GENESIS))throw Error("Chain link mismatch at line "+(i+1));
    if(typeof row.digest!=="string"||row.digest!==digestFor(row))throw Error("Digest mismatch at line "+(i+1));
    if(!Array.isArray(row.results)||row.results.length<1||row.results.length>12||typeof row.observedAt!=="string"||!Number.isFinite(Date.parse(row.observedAt)))throw Error("Malformed observations at line "+(i+1));
    for(const entry of row.results){
      if(!entry||typeof entry.hash!=="string"||parseHashes([entry.hash])[0]!==entry.hash||!(entry.status===null||typeof entry.status==="string")||!(entry.error===null||typeof entry.error==="string"))throw Error("Malformed observation at line "+(i+1));
    }
    records.push(row);
  }
  return records;
}
export async function appendObservation(file, report) {
  if(!report||report.schema!=="genlayer-verdict-ledger/1"||report.chainId!==61999||report.method!=="gen_getTransactionStatus"||!Array.isArray(report.results)||report.results.length<1||report.results.length>12)throw Error("Invalid report");
  const lock=await open(file+".lock","wx"); // refuse unsafe overlapping writers rather than risk log corruption
  try {
    const existing=await loadHistory(file);
    if(existing.length>=MAX_RECORDS)throw Error("Log is full");
    const item={schema:SCHEMA,sequence:existing.length+1,previousDigest:existing.length?existing.at(-1).digest:GENESIS,observedAt:report.observedAt,
      chain:report.chain,chainId:report.chainId,endpoint:report.endpoint,method:report.method,results:report.results};
    item.digest=digestFor(item);
    await appendFile(file,JSON.stringify(item)+"\n",{encoding:"utf8",flag:"a"});
    const reread=await loadHistory(file);
    if(reread.length!==item.sequence||reread.at(-1).digest!==item.digest)throw Error("Append verification failed");
    return item;
  } finally {await lock.close();await unlink(file+".lock");}
}
export function summarize(records) {
  const txs=new Map();
  for(const record of records){
    for(const item of record.results){
      let tx=txs.get(item.hash);
      if(!tx){tx={hash:item.hash,latestObservedStatus:null,events:[],changes:0,errors:0};txs.set(item.hash,tx);}
      if(item.error)tx.errors++;
      if(item.status!==null){
        if(tx.latestObservedStatus!==null&&tx.latestObservedStatus!==item.status)tx.changes++;
        tx.latestObservedStatus=item.status;
      }
      tx.events.push({sequence:record.sequence,observedAt:record.observedAt,status:item.status,error:item.error,knownStatus:item.knownStatus??null});
    }
  }
  return {schema:"verdict-ledger-report/1",chain:"GenLayer Studionet",entries:records.length,firstDigest:records[0]?.digest??null,
    lastDigest:records.at(-1)?.digest??null,transactions:[...txs.values()],
    caveats:["Observations are point-in-time RPC results, not a complete consensus transition log.","The hash chain detects accidental or simple edits but does not authenticate RPC responses or protect against a full malicious history rewrite.","Consensus status does not prove successful execution; no receipt is supplied."]};
}
