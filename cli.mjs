import {writeFile} from "node:fs/promises";
import {audit} from "./ledger.mjs";
import {appendObservation,loadHistory,summarize} from "./history.mjs";
const HELP="Usage: node cli.mjs observe HASH [HASH...] [--file ledger-history.jsonl] | verify [--file ledger-history.jsonl] | report [--file ledger-history.jsonl] | export --output report.json [--file ledger-history.jsonl]";
async function main(){
  const args=process.argv.slice(2);
  const command=args.shift();
  if(!["observe","verify","report","export"].includes(command))throw Error(HELP);
  function option(name,defaultValue){
    const index=args.indexOf(name);
    if(index<0)return defaultValue;
    if(index===args.length-1||args[index+1].startsWith("--"))throw Error("Missing value for "+name);
    return args.splice(index,2)[1];
  }
  const file=option("--file","ledger-history.jsonl");
  const output=option("--output",null);
  if(command==="observe"){
    if(output)throw Error("Use export for JSON output");
    const observation=await audit(args);
    const entry=await appendObservation(file,observation);
    console.log(JSON.stringify({sequence:entry.sequence,digest:entry.digest,results:entry.results},null,2));
    if(entry.results.some(r=>r.error))process.exitCode=2;
    return;
  }
  if(args.length)throw Error("Unknown arguments: "+args.join(" "));
  const records=await loadHistory(file);
  if(command==="verify"){console.log(JSON.stringify({valid:true,entries:records.length,lastDigest:records.at(-1)?.digest??null},null,2));return;}
  const report=summarize(records);
  if(command==="report"){console.log(JSON.stringify(report,null,2));return;}
  if(!output||!output.endsWith(".json"))throw Error("export requires --output with .json extension");
  await writeFile(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
  console.log("Exported: "+output);
}
main().catch(e=>{console.error("ERROR: "+String(e.message??e));process.exitCode=1;});
