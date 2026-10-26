import { createServer } from "node:http";
import {randomBytes} from "node:crypto";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {audit,parseHashes} from "./ledger.mjs";
import {appendObservation,loadHistory,summarize} from "./history.mjs";

const root=path.dirname(fileURLToPath(import.meta.url));
const assets=new Map([["/",["web/index.html","text/html; charset=utf-8"]],["/app.js",["web/app.js","text/javascript; charset=utf-8"]],["/style.css",["web/style.css","text/css; charset=utf-8"]]]);
const security={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","x-frame-options":"DENY","content-security-policy":"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
function json(res,status,data,headers={}) {res.writeHead(status,{...security,"content-type":"application/json; charset=utf-8",...headers});res.end(JSON.stringify(data));}
function fail(res,status,message){json(res,status,{error:message});}
export function createLedgerServer({file=path.join(root,"ledger-history.jsonl"),auditFn=audit,port=5179,host="127.0.0.1"}={}) {
  const token=randomBytes(32).toString("hex");
  let busy=false,used=0,resetAt=Date.now()+60000;
  const server=createServer(async(req,res)=>{
    try {
      const url=new URL(req.url||"/","http://localhost");
      const portNow=server.address()?.port;
      const allowedHost=req.headers.host==="127.0.0.1:"+portNow||req.headers.host==="localhost:"+portNow;
      if(!allowedHost)return fail(res,403,"Unexpected host");
      if(req.method==="GET"&&assets.has(url.pathname)&&!url.search){
        const [fileName,type]=assets.get(url.pathname);
        const body=await readFile(path.join(root,fileName));
        res.writeHead(200,{...security,"content-type":type});res.end(body);return;
      }
      if(req.method==="GET"&&url.pathname==="/api/session")return json(res,200,{token,maxPerMinute:20,maxPerRequest:12});
      if(req.method==="GET"&&url.pathname==="/api/report")return json(res,200,summarize(await loadHistory(file)));
      if(req.method==="GET"&&url.pathname==="/api/export")return json(res,200,summarize(await loadHistory(file)),{"content-disposition":'attachment; filename="genlayer-verdict-report.json"'});
      if(req.method==="POST"&&url.pathname==="/api/observe"){
        const origin="http://"+req.headers.host;
        if(req.headers.origin!==origin||req.headers["x-session-token"]!==token)return fail(res,403,"Request origin or token not allowed");
        if(!String(req.headers["content-type"]||"").startsWith("application/json"))return fail(res,415,"JSON required");
        if(busy)return fail(res,409,"A query is already running");
        let body="";
        for await(const chunk of req){body+=chunk.toString("utf8");if(Buffer.byteLength(body)>2048)return fail(res,413,"Request too large");}
        let hashes;
        try{hashes=parseHashes(JSON.parse(body).hashes);}catch(e){return fail(res,400,String(e.message??e));}
        if(Date.now()>resetAt){used=0;resetAt=Date.now()+60000;}
        if(used+hashes.length>20)return fail(res,429,"Limit: maximum 20 read-only requests per minute");
        try{await loadHistory(file);}catch(e){return fail(res,409,"History verification failed: "+e.message);}
        used+=hashes.length;busy=true;
        try {
          const report=await auditFn(hashes);
          const stored=await appendObservation(file,report);
          return json(res,200,{observation:stored,report:summarize(await loadHistory(file))});
        } finally {busy=false;}
      }
      fail(res,404,"Not found");
    }catch(e){fail(res,500,String(e?.message??e).slice(0,250));}
  });
  return {server,listen:()=>new Promise((resolve,reject)=>{server.once("error",reject);server.listen(port,host,()=>resolve({url:"http://"+host+":"+server.address().port,port:server.address().port}));}),close:()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const app=createLedgerServer({port:Number(process.env.VERDICT_PORT||5179)});
  app.listen().then(x=>console.log("GenLayer Verdict Ledger: "+x.url+" - close this window to stop")).catch(e=>{console.error(e);process.exitCode=1;});
}
