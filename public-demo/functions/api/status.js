// Cloudflare Pages Function, read-only and fixed upstream. No credentials or wallet writes.
const RPC="https://studio.genlayer.com/api";
const HEX=/^0x[0-9a-f]{64}$/;
const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
export async function onRequestPost({request}){
  const url=new URL(request.url);
  if(request.headers.get("origin")!==url.origin)return response({error:"Same-origin requests only"},403);
  if(!String(request.headers.get("content-type")||"").startsWith("application/json"))return response({error:"JSON body required"},415);
  if(Number(request.headers.get("content-length")||0)>1400)return response({error:"Request too large"},413);
  let payload;
  try{
    const text=await request.text();
    if(text.length>1400)return response({error:"Request too large"},413);
    payload=JSON.parse(text);
  }catch{return response({error:"Invalid JSON"},400);}
  const hashes=payload?.hashes;
  if(!Array.isArray(hashes)||hashes.length<1||hashes.length>6||hashes.some(x=>typeof x!=="string"||!HEX.test(x)))return response({error:"Provide 1–6 normalized transaction hashes"},400);
  const results=[];
  for(const hash of [...new Set(hashes)]){
    try{
      const upstream=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",id:1,method:"gen_getTransactionStatus",params:[hash]}),signal:AbortSignal.timeout(8000)});
      if(!upstream.ok){results.push({hash,status:null,error:"RPC HTTP "+upstream.status});continue;}
      const body=await upstream.json();
      const value=typeof body.result==="string"?body.result:body.result?.status;
      if(body.error){results.push({hash,status:null,error:String(body.error.message||"RPC error").slice(0,150)});continue;}
      if(typeof value!=="string"||value.length>80){results.push({hash,status:null,error:"Invalid RPC status response"});continue;}
      results.push({hash,status:value,error:null});
    }catch(e){results.push({hash,status:null,error:String(e?.name||"Network error").slice(0,100)});}
  }
  return response({chain:"GenLayer Studionet",method:"gen_getTransactionStatus",at:new Date().toISOString(),results});
}
export const onRequestGet=()=>response({error:"POST only"},405);
