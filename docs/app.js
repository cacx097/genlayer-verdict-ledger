import {STORE_KEY,parseHashes,verify,addObservation,summarize} from "./history-core.js";
const el=id=>document.getElementById(id);
let history=[];
const msg=(s,error=false)=>{el("notice").textContent=s;el("notice").className=error?"error":""};
function render(){
 const x=summarize(history);
 el("entries").textContent=x.entries;
 el("unique").textContent=x.transactions.length;
 el("changes").textContent=x.transactions.reduce((n,t)=>n+t.changes,0);
 el("errors").textContent=x.transactions.reduce((n,t)=>n+t.errors,0);
 el("digest").textContent=x.lastDigest??"기록 없음";
 const rows=el("rows");rows.replaceChildren();
 for(const t of x.transactions){
   const tr=document.createElement("tr");
   for(const value of [t.hash.slice(0,12)+"…"+t.hash.slice(-8),t.latest??"확인되지 않음",String(t.changes),t.errors+" / "+t.observations]){
     const td=document.createElement("td");td.textContent=value;tr.append(td);
   }
   rows.append(tr);
 }
 if(!x.transactions.length){const tr=document.createElement("tr");const td=document.createElement("td");td.colSpan=4;td.textContent="조회된 기록이 없습니다.";tr.append(td);rows.append(tr);}
}
el("hashes").addEventListener("input",()=>el("count").textContent=el("hashes").value.split(/[\s,]+/).filter(Boolean).length+" / 6");
el("observe").addEventListener("click",async()=>{
 const button=el("observe");button.disabled=true;msg("읽기 전용 거래 상태를 조회하고 있습니다.");
 try{
   const hashes=parseHashes(el("hashes").value);
   await verify(history);
   const results=[];
   for(const hash of hashes){
     try{
       const response=await fetch("https://studio.genlayer.com/api",{
         method:"POST",headers:{"content-type":"application/json"},
         body:JSON.stringify({jsonrpc:"2.0",id:1,method:"gen_getTransactionStatus",params:[hash]}),
         signal:AbortSignal.timeout(10000)
       });
       if(!response.ok){results.push({hash,status:null,error:"RPC HTTP "+response.status});continue;}
       const payload=await response.json();
       const status=typeof payload.result==="string"?payload.result:payload.result?.status;
       if(payload.error)results.push({hash,status:null,error:String(payload.error.message||"RPC error").slice(0,150)});
       else if(typeof status==="string"&&status.length<=80)results.push({hash,status,error:null});
       else results.push({hash,status:null,error:"Invalid RPC response"});
     }catch(error){results.push({hash,status:null,error:String(error?.name||"Network error").slice(0,100)});}
   }
   const data={at:new Date().toISOString(),results};
   const next=await addObservation(history,data.results,data.at);
   localStorage.setItem(STORE_KEY,JSON.stringify(next));history=next;render();
   msg("관측 #"+history.length+" 저장 완료 · "+data.results.filter(x=>!x.error).length+"건 상태 응답");
 }catch(e){msg(String(e.message||e),true)}
 finally{button.disabled=false;}
});
el("export").addEventListener("click",async()=>{
 try{
   await verify(history);
   const content=JSON.stringify(summarize(history),null,2);
   const url=URL.createObjectURL(new Blob([content],{type:"application/json"}));
   const a=document.createElement("a");a.href=url;a.download="genlayer-verdict-report.json";document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
   msg("검증된 이력을 JSON으로 저장했습니다.");
 }catch(e){msg("기록 검증 실패: "+e.message,true);}
});
el("reset").addEventListener("click",()=>{
 if(!confirm("저장된 이력을 영구 초기화할까요? 내보내기한 파일은 유지됩니다."))return;
 localStorage.removeItem(STORE_KEY);history=[];el("observe").disabled=false;el("export").disabled=false;render();msg("브라우저 기록을 초기화했습니다.");
});
try{
 const raw=localStorage.getItem(STORE_KEY);
 history=raw?JSON.parse(raw):[];
 await verify(history);render();
}catch(e){history=[];msg("저장된 기록에 오류가 있습니다. 내보내기/조회 전에 기록을 확인하세요: "+e.message,true);el("observe").disabled=true;el("export").disabled=true;}
