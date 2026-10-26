import { writeFile } from "node:fs/promises";

const RPC = "https://studio.genlayer.com/api";
const HEX = /^0x[0-9a-fA-F]{64}$/;
const MAX = 12;
const norm = x => String(x).trim().toLowerCase();
const STATES = new Set(["UNINITIALIZED","PENDING","PROPOSING","COMMITTING","REVEALING","ACCEPTED","UNDETERMINED","FINALIZED","CANCELED","APPEALREVEALING","APPEALCOMMITTING","VALIDATORSTIMEOUT","LEADERTIMEOUT","LEADERREVEALING"]);

export function parseHashes(values) {
  if (values.length < 1 || values.length > MAX) throw Error("Provide 1-12 transaction hashes");
  const hashes = values.map(norm);
  if (hashes.some(h => !HEX.test(h))) throw Error("Each hash must be 0x followed by 64 hexadecimal digits");
  return [...new Set(hashes)];
}
export async function statusFor(hash, fetcher = fetch) {
  const payload = {jsonrpc:"2.0",id:1,method:"gen_getTransactionStatus",params:[hash]};
  try {
    const response=await fetcher(RPC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});
    const body=await response.json();
    if (!response.ok || body.error) return {hash,status:null,error:String(body.error?.message??"HTTP "+response.status).slice(0,300)};
    // The observed stable Studionet backend returns a string. Newer docs describe {status,statusCode}.
    const value=typeof body.result==="string"?body.result:body.result?.status;
    if(typeof value!=="string" || value.length>80) return {hash,status:null,error:"Unexpected RPC response, no valid status"};
    const status=value.trim();
    return {hash,status,error:null,knownStatus:STATES.has(status.toUpperCase())};
  } catch(error) {return {hash,status:null,error:String(error).slice(0,300)};}
}
export async function audit(hashes, fetcher=fetch) {
  const unique=parseHashes(hashes);
  const results=[];
  for(const hash of unique) results.push(await statusFor(hash,fetcher));
  return {schema:"genlayer-verdict-ledger/1",chain:"GenLayer Studionet",chainId:61999,endpoint:RPC,method:"gen_getTransactionStatus",observedAt:new Date().toISOString(),results,
    limitations:"Stored consensus status only. ACCEPTED or FINALIZED does NOT prove execution success. No receipt, execution result, validator proof, or wallet transaction was obtained."};
}
if(process.argv[1]?.endsWith("ledger.mjs")){
  const args=process.argv.slice(2);
  const outputIndex=args.indexOf("--output");
  const output=outputIndex>=0?args[outputIndex+1]:null;
  if(outputIndex>=0)args.splice(outputIndex,2);
  try{
    const report=await audit(args);
    const json=JSON.stringify(report,null,2);
    if(output){if(!/^[\w.\-]+\.json$/.test(output))throw Error("Output must be a simple .json filename");await writeFile(output,json+"\n",{flag:"wx"});}
    process.stdout.write(json+"\n");
    if(report.results.some(r=>r.error))process.exitCode=2;
  }catch(e){console.error(String(e));process.exitCode=1;}
}
