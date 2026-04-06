import { useState, useEffect, useCallback, useRef } from "react";

/* ── Data ── */
const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color:"#7C6AE8", bg:"#E8E0FF", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50,topic:"what AI agents are — the Perceive-Reason-Act-Learn loop, how they differ from chatbots, ReAct pattern, core components: LLM + Tools + Memory + Planning"},
    {id:"f2",t:"LLMs as the Brain",xp:50,topic:"how LLMs (GPT-4o, Claude, Gemini, Llama, Mistral) serve as agent reasoning engines, context windows, choosing models"},
    {id:"f3",t:"Tools & Functions",xp:60,topic:"how tools give agents ability to ACT, function calling mechanics, when LLM calls tools and what arguments it passes"},
    {id:"f4",t:"Memory & RAG",xp:60,topic:"agent memory: short-term (conversation), long-term (vector DBs), episodic, RAG (Retrieval Augmented Generation)"},
    {id:"f5",t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct, task decomposition, why planning matters"},
    {id:"f6",t:"Build: Research Agent",xp:100,topic:"building a Python research agent: search web, summarize articles, write briefings using LLM API + search tool"}
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color:"#E07A42", bg:"#FFE5D0", lessons:[
    {id:"w1",t:"LangGraph",xp:70,topic:"LangGraph directed graphs, checkpointing, time-travel debugging, LangSmith observability"},
    {id:"w2",t:"CrewAI",xp:60,topic:"CrewAI role-based teams: Role+Backstory+Goal, Crews and Flows, prototyping in 20 lines"},
    {id:"w3",t:"AutoGen & SDKs",xp:70,topic:"AutoGen conversational debate, OpenAI Agents SDK handoffs, Google ADK A2A protocol"},
    {id:"w4",t:"MCP Protocol",xp:80,topic:"Model Context Protocol — USB-C of AI, 12000+ servers, connecting LLMs to tools universally"},
    {id:"w5",t:"MetaGPT & More",xp:60,topic:"MetaGPT SOPs for software companies, OpenAgents native MCP+A2A, n8n no-code agents"},
    {id:"w6",t:"Build: FW Battle",xp:120,topic:"building same agent in CrewAI vs LangGraph vs AutoGen, comparing code, speed, cost"}
  ]},
  { id:"multi", title:"Multi-Agent", sub:"AI ORG", icon:"🏢", color:"#2D3436", bg:"#E8E8E8", lessons:[
    {id:"m1",t:"Communication",xp:70,topic:"agent comms: Shared State, Message Passing, Event-Driven pub/sub, Hierarchical delegation"},
    {id:"m2",t:"AI Organization",xp:80,topic:"designing multi-agent org: CEO, CMO, CTO, CFO, Sales, HR, Legal, Ops as autonomous agents"},
    {id:"m3",t:"Orchestration",xp:80,topic:"Sequential, Parallel, Hierarchical, Consensus, Competitive orchestration patterns"},
    {id:"m4",t:"Cost & Safety",xp:70,topic:"LLM costs (4x5=20 calls), tiered models, circuit breakers, guardrails, budget caps"},
    {id:"m5",t:"Build: AI Startup",xp:150,topic:"6-agent startup team: market Q in, full business package out"}
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color:"#E07A42", bg:"#FFE5D0", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70,topic:"Salesforce Agentforce 18.5K deals, Microsoft Copilot 15M seats, Gartner 40% prediction"},
    {id:"r2",t:"Semiconductor AI",xp:90,topic:"AI agents for HCL-Foxconn OSAT: yield optimization, supply chain, equipment, quality docs"},
    {id:"r3",t:"Solo Stack",xp:80,topic:"1 person + 10 agents: content pipeline, sales machine, competitor intel, bookkeeping"},
    {id:"r4",t:"Crazy Mode",xp:100,topic:"agent swarms, self-improving agents, digital twins, Manus $2B, agentic SOC, intent computing"},
    {id:"r5",t:"Final Boss",xp:200,topic:"capstone: 10+ agent company producing research, plan, landing page, posts, financials in parallel"}
  ]}
];

const MODES = [
  {id:"class5",label:"🏏 Simple",prompt:"Explain like I'm 10. Cricket analogies, everyday Indian examples, stories. No jargon."},
  {id:"engineer",label:"🔧 Engineer",prompt:"Full technical depth with Python code examples and architecture details."},
  {id:"founder",label:"💼 Founder",prompt:"Business/strategy lens. ROI, competitive moats. Connect to HCL semiconductor."},
  {id:"hacker",label:"⚡ Hacker",prompt:"Speed-run. Skip theory, give copy-paste code that works. Ship in 2 hours."},
  {id:"crazy",label:"🤯 Crazy",prompt:"Wildest bleeding-edge stuff. Science fiction. Agent swarms, autonomous companies."},
  {id:"first",label:"🧠 Socratic",prompt:"Don't answer — ask ME questions to derive the answer. First principles."},
  {id:"semi",label:"🏭 Semi",prompt:"Explain through semiconductor manufacturing lens. HCL-Foxconn OSAT context."},
];

const CURIOSITY = [
  {id:"industry",label:"🏭 Your Industry",desc:"AI in semiconductor & HCL",query:"AI agents semiconductor manufacturing India 2026"},
  {id:"general",label:"🌍 General",desc:"What people are building now",query:"amazing AI agent projects people built 2026"},
  {id:"crazy",label:"🤯 Crazy Future",desc:"Mind-bending future stuff",query:"most crazy futuristic AI agent applications 2026"},
  {id:"daily",label:"💼 Daily Work",desc:"Making daily work easier",query:"AI agents automate daily office work productivity 2026"}
];

const RES: Record<string, {n:string;u:string;d:string}[]> = {
  "MCP":[{n:"mcp.so",u:"https://mcp.so",d:"19,500+"},{n:"PulseMCP",u:"https://pulsemcp.com/servers",d:"11,150+"},{n:"Glama",u:"https://glama.ai/mcp/servers",d:"Curated"},{n:"LobeHub",u:"https://lobehub.com/mcp",d:"48K+"},{n:"GitHub",u:"https://github.com/modelcontextprotocol/servers",d:"Official"}],
  "Repos":[{n:"crewAI",u:"https://github.com/crewAIInc/crewAI",d:"Teams"},{n:"langgraph",u:"https://github.com/langchain-ai/langgraph",d:"Graphs"},{n:"MetaGPT",u:"https://github.com/geekan/MetaGPT",d:"SW Co"},{n:"AutoGPT",u:"https://github.com/Significant-Gravitas/AutoGPT",d:"100K⭐"},{n:"OpenClaw",u:"https://github.com/nicepkg/openclaw",d:"210K⭐"},{n:"n8n",u:"https://github.com/n8n-io/n8n",d:"Workflow"}],
  "YouTube":[{n:"3Blue1Brown",u:"https://youtube.com/@3blue1brown",d:"Math"},{n:"Karpathy",u:"https://youtube.com/@AndrejKarpathy",d:"GPT"},{n:"AI Jason",u:"https://youtube.com/@AIJason",d:"Agents"},{n:"Nate Herk",u:"https://youtube.com/@NateHerk",d:"n8n"},{n:"Sabrina R",u:"https://youtube.com/@SabrinaRamonov",d:"1.4M"}],
  "News":[{n:"Rundown AI",u:"https://therundown.ai",d:"2M+"},{n:"The Batch",u:"https://deeplearning.ai/the-batch/",d:"Ng"},{n:"AlphaSignal",u:"https://alphasignal.ai",d:"Repos"},{n:"Latent Space",u:"https://latent.space",d:"Eng"}]
};

const SYS = "You are AGENT SENSEI, an elite AI Agents tutor teaching someone at HCL's Founder's Office (semiconductor OSAT plant). Be passionate, use Indian examples (HCL, Tata, Flipkart). Keep under 250 words. End with a question. Use clear formatting with line breaks.";

interface UserState {
  xp: number; done: string[]; str: number; last: string|null; perf: number;
  lv: number; bdg: string[]; weekXp: number[]; curious: number;
  notes: Record<string,string>; bookmarks: string[];
}

const INIT: UserState = {xp:0,done:[],str:0,last:null,perf:0,lv:1,bdg:[],weekXp:[0,0,0,0,0,0,0],curious:0,notes:{},bookmarks:[]};

function ukey(n: string){return "adojo-"+(n||"x").toLowerCase().replace(/[^a-z0-9]/g,"")}

async function callAPI(messages: {role:string;content:string}[], useSearch=false) {
  const body: any = {model:"claude-sonnet-4-20250514",max_tokens:1024,messages};
  if(!useSearch) body.system = SYS;
  if(useSearch) body.tools = [{type:"web_search_20250305",name:"web_search"}];
  const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!resp.ok) throw new Error("API "+resp.status);
  const data = await resp.json();
  if(data.error) throw new Error(data.error.message||"API error");
  let txt = "";
  for(const block of (data.content||[])){if(block.type==="text"&&block.text) txt+=block.text+"\n"}
  if(!txt.trim()) throw new Error("Empty response");
  return txt.trim();
}

async function searchAPI(query: string) {
  const result = await callAPI([{role:"user",content:"Search web for: "+query+"\n\nReturn ONLY a JSON array of 5 items with: title, url, desc (1 sentence), type (tool/repo/article/video/news). No markdown fences."}],true);
  const cleaned = result.replace(/```json|```/g,"").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if(match){const p=JSON.parse(match[0]);if(Array.isArray(p)&&p.length>0)return p}
  return [{title:"Results",url:"#",desc:cleaned.slice(0,200),type:"article" as const}];
}

type Msg = {role:"user"|"assistant"; text:string};

const Index = () => {
  const [s,setS]=useState<UserState>(INIT);
  const [v,setV]=useState("login");
  const [rdy,setRdy]=useState(false);
  const [un,setUn]=useState("");
  const [ln,setLn]=useState("");
  const [lr,setLr]=useState("");
  const [aLes,setALes]=useState<any>(null);
  const [msgs,setMsgs]=useState<Msg[]>([]);
  const [inp,setInp]=useState("");
  const [cld,setCld]=useState(false);
  const [mode,setMode]=useState("engineer");
  const [curC,setCurC]=useState<string|null>(null);
  const [curR,setCurR]=useState<any[]>([]);
  const [curL,setCurL]=useState(false);
  const [tab,setTab]=useState("MCP");
  const [sq,setSq]=useState("");
  const [sres,setSres]=useState<any[]>([]);
  const [sld,setSld]=useState(false);
  const [pop,setPop]=useState<any>(null);
  const [note,setNote]=useState("");
  const [showNote,setShowNote]=useState(false);
  const [timer,setTimer]=useState(0);
  const [timerOn,setTimerOn]=useState(false);
  const chatEnd=useRef<HTMLDivElement>(null);
  const timerRef=useRef<any>(null);

  useEffect(()=>{(async()=>{try{const stored=localStorage.getItem("adojo-user");if(stored){setUn(stored);const d=localStorage.getItem(ukey(stored));if(d)setS({...INIT,...JSON.parse(d)});setV("home")}}catch{}setRdy(true)})()},[]);
  useEffect(()=>{if(chatEnd.current)chatEnd.current.scrollIntoView({behavior:"smooth"})},[msgs]);
  useEffect(()=>{if(timerOn){timerRef.current=setInterval(()=>setTimer(t=>t+1),1000)}else{clearInterval(timerRef.current)}return()=>clearInterval(timerRef.current)},[timerOn]);

  const save=useCallback((ns: UserState)=>{setS(ns);try{localStorage.setItem(ukey(un),JSON.stringify(ns))}catch{}},[un]);

  const login=()=>{if(!ln.trim())return;const n=ln.trim();setUn(n);localStorage.setItem("adojo-user",n);const ex=localStorage.getItem(ukey(n));if(ex)setS({...INIT,...JSON.parse(ex)});else localStorage.setItem(ukey(n),JSON.stringify(INIT));setV("home")};
  const logout=()=>{localStorage.removeItem("adojo-user");setUn("");setS(INIT);setV("login")};

  const openLesson=(lesson: any)=>{
    setALes(lesson);setMsgs([{role:"assistant",text:"⏳ Loading lesson..."}]);
    setCld(true);setV("lesson");setTimer(0);setTimerOn(true);
    setNote(s.notes?.[lesson.id]||"");
    const mObj=MODES.find(m=>m.id===mode)||MODES[1];
    callAPI([{role:"user",content:"Teach me about: "+lesson.topic+"\n\nStyle: "+mObj.prompt+"\n\nBe engaging. Use examples. End with a question."}])
    .then(reply=>{setMsgs([{role:"assistant",text:reply}]);setCld(false)})
    .catch(()=>{setMsgs([{role:"assistant",text:"Welcome to **"+lesson.t+"**!\n\nThis lesson covers "+lesson.topic+".\n\nThe AI tutor is connecting... Try sending a message below to start, or use the quick action buttons.\n\nWhat would you like to learn?"}]);setCld(false)});
  };

  const sendMsg=(customMsg?: string)=>{
    const userMsg=customMsg||inp.trim();if(!userMsg||cld)return;setInp("");
    const newMsgs: Msg[]=[...msgs,{role:"user",text:userMsg}];setMsgs(newMsgs);setCld(true);
    const mObj=MODES.find(m=>m.id===mode)||MODES[1];
    const apiMsgs=newMsgs.slice(-6).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
    apiMsgs.push({role:"user",content:"[Context: "+aLes.topic+". Style: "+mObj.prompt+". Under 250 words. End with question.]"});
    callAPI(apiMsgs as any)
    .then(reply=>{setMsgs([...newMsgs,{role:"assistant",text:reply}]);setCld(false)})
    .catch(err=>{setMsgs([...newMsgs,{role:"assistant",text:"Connection issue: "+err.message+"\n\nPlease try again."}]);setCld(false)});
  };

  const markDone=()=>{
    if(!aLes||s.done.includes(aLes.id))return;
    const ns={...s,done:[...s.done,aLes.id],xp:s.xp+aLes.xp,lv:Math.floor((s.xp+aLes.xp)/500)+1};
    const td=new Date().toDateString();
    if(ns.last!==td){const yd=new Date(Date.now()-864e5).toDateString();ns.str=ns.last===yd?ns.str+1:1;ns.last=td}
    const wk=[...ns.weekXp];wk[new Date().getDay()]=(wk[new Date().getDay()]||0)+aLes.xp;ns.weekXp=wk;
    save(ns);setTimerOn(false);
  };

  const saveNote=()=>{save({...s,notes:{...s.notes,[aLes.id]:note}})};
  const toggleBM=(lid: string)=>{const bm=s.bookmarks||[];save({...s,bookmarks:bm.includes(lid)?bm.filter(x=>x!==lid):[...bm,lid]})};

  const doCuriosity=async(cat: typeof CURIOSITY[0])=>{setCurC(cat.id);setCurR([]);setCurL(true);save({...s,curious:(s.curious||0)+1});try{setCurR(await searchAPI(cat.query))}catch(e: any){setCurR([{title:"Try again",url:"#",desc:e.message,type:"news"}])}setCurL(false)};
  const doSearch=async()=>{if(!sq.trim()||sld)return;setSld(true);setSres([]);try{setSres(await searchAPI(sq+" AI agents"))}catch(e: any){setSres([{title:"Error",url:"#",desc:e.message,type:"news"}])}setSld(false)};

  const totL=MODULES.reduce((a,m)=>a+m.lessons.length,0);
  const pct=totL?Math.round(s.done.length/totL*100):0;
  const tI: Record<string,string>={tool:"🔧",repo:"📦",article:"📰",video:"🎬",news:"📡"};
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const mxW=Math.max(...(s.weekXp||[0,0,0,0,0,0,0]),1);
  const dn=un||"Learner";
  const fmtTime=(sec: number)=>`${Math.floor(sec/60)}m ${sec%60}s`;

  if(!rdy)return(<div className="flex items-center justify-center h-screen" style={{background:"#FDF0E6"}}><div className="text-5xl">🧠</div></div>);

  return(
    <div className="min-h-screen" style={{background:"#FDF0E6",fontFamily:"system-ui,sans-serif",color:"#2D3436"}}>
      <style>{`@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes pi{0%{transform:scale(0)}60%{transform:scale(1.12)}100%{transform:scale(1)}}@keyframes pu{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}.shm{height:40px;border-radius:12px;background:linear-gradient(90deg,#f0e4d8 25%,#faeadb 50%,#f0e4d8 75%);background-size:200% 100%;animation:sh 1.5s infinite;margin-bottom:6px}@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}`}</style>

      {pop&&(<div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.4)"}} onClick={()=>setPop(null)}><div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:"32px 28px",textAlign:"center",maxWidth:260,animation:"pi .4s",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}}><div style={{fontSize:48,animation:"pu 1s infinite"}}>{pop.ic}</div><div style={{color:"#E07A42",fontSize:10,letterSpacing:3,fontWeight:700,marginTop:4}}>UNLOCKED</div><div style={{fontSize:18,fontWeight:800,margin:"4px 0"}}>{pop.nm}</div><button onClick={()=>setPop(null)} style={{marginTop:12,background:"#E07A42",border:"none",color:"#fff",padding:"8px 24px",borderRadius:14,fontWeight:700,cursor:"pointer"}}>Nice!</button></div></div>)}

      {/* LOGIN */}
      {v==="login"&&(<div className="min-h-screen flex flex-col items-center justify-center p-5" style={{animation:"fu .4s"}}>
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-3xl font-extrabold mb-1">AgentDojo</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">AI Agents Learning Platform</p>
        <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:340,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
          <div className="text-xs font-semibold text-gray-400 mb-1">Name</div>
          <input value={ln} onChange={e=>setLn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")login()}} placeholder="A Tarun" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none mb-3"/>
          <div className="text-xs font-semibold text-gray-400 mb-1">Role (optional)</div>
          <input value={lr} onChange={e=>setLr(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")login()}} placeholder="HCL Founder's Office" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none mb-4"/>
          <button onClick={login} className="w-full p-3 rounded-2xl text-white font-bold text-sm cursor-pointer" style={{background:"#2D3436",border:"none"}}>Start Learning →</button>
          <p className="text-center text-xs text-gray-300 mt-3">Progress saves per account</p>
        </div>
      </div>)}

      {v!=="login"&&(<div>
        {v!=="lesson"&&(<div className="px-4 pt-3 pb-1 mx-auto" style={{maxWidth:520}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold" style={{background:"linear-gradient(135deg,#E07A42,#F4A261)"}}>{dn[0].toUpperCase()}</div>
              <div><div className="font-bold text-sm">Hello, {dn}</div><div className="text-xs text-gray-400">⚡ {pct}% · L{s.lv} · {s.xp}XP</div></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow text-sm">🔔</div>
          </div>
        </div>)}

        <div className="mx-auto" style={{maxWidth:520,padding:v==="lesson"?"0":"0 14px 96px"}}>

        {/* HOME */}
        {v==="home"&&(<div style={{animation:"fu .3s"}}>
          <div style={{background:"linear-gradient(135deg,#7C6AE8,#9B8AFF)",borderRadius:22,padding:"20px 16px",marginTop:8,marginBottom:12,color:"#fff",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-25,right:-15,fontSize:100,opacity:.06}}>🏆</div>
            <h2 className="text-xl font-extrabold leading-tight mb-1">AI Agents<br/>Masterclass</h2>
            <p className="text-xs opacity-70 mb-3">Interactive AI tutor · 7 teaching modes</p>
            <div className="flex gap-1">
              {[`🔥 ${s.str}d`,`⚡ ${s.xp} XP`,`📚 ${s.done.length}/${totL}`].map((t,i)=>(<div key={i} style={{background:"rgba(255,255,255,.18)",borderRadius:8,padding:"3px 8px",fontSize:9,fontWeight:600}}>{t}</div>))}
            </div>
          </div>

          <div style={{...({background:"#fff",borderRadius:20,boxShadow:"0 2px 10px rgba(0,0,0,.04)",border:"1px solid rgba(0,0,0,.04)"}),padding:"12px 14px",marginBottom:12}}>
            <div className="font-bold text-xs mb-2">This week</div>
            {days.slice(1,6).map((d,i)=>{const idx=i+1;const val=(s.weekXp||[])[idx]||0;const w=mxW>0?Math.max(val/mxW*100,4):4;return(
              <div key={d} className="flex items-center gap-1.5 mb-1">
                <span className="text-xs text-gray-400" style={{width:24}}>{d}</span>
                <div className="flex-1 rounded-md" style={{background:"#F5EDE5",height:18}}><div style={{width:`${w}%`,height:"100%",background:idx===new Date().getDay()?"#E07A42":"#C4B5A4",borderRadius:6}}/></div>
                {val>0&&(<span className="text-xs font-bold text-white rounded-md px-1.5" style={{background:"#E07A42",fontSize:8}}>{val}</span>)}
              </div>
            )})}
          </div>

          {(s.bookmarks||[]).length>0&&(<div style={{background:"#fff",borderRadius:20,padding:"10px 14px",marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}><div className="font-bold text-xs mb-1.5">⭐ Bookmarked</div>{s.bookmarks.map(bid=>{let les: any=null;MODULES.forEach(m=>m.lessons.forEach(l=>{if(l.id===bid)les=l}));if(!les)return null;return(<div key={bid} onClick={()=>openLesson(les)} className="text-xs py-0.5 cursor-pointer font-semibold" style={{color:"#E07A42"}}>{les.t} →</div>)})}</div>)}

          {MODULES.map(mod=>{
            const mD=mod.lessons.filter(l=>s.done.includes(l.id)).length;
            const mP=Math.round(mD/mod.lessons.length*100);
            return(<div key={mod.id} style={{background:mod.bg,borderRadius:20,padding:14,marginBottom:10,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-12,right:-8,fontSize:50,opacity:.06}}>{mod.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm shadow">{mod.icon}</div>
                <div className="flex-1"><div style={{fontSize:9,color:mod.color,fontWeight:700,letterSpacing:1}}>{mod.sub}</div><div className="font-bold text-sm">{mod.title}</div></div>
                <span className="text-xs text-gray-400">{mD}/{mod.lessons.length}</span>
              </div>
              <div style={{background:"rgba(0,0,0,.06)",borderRadius:3,height:3,marginBottom:8}}><div style={{width:`${mP}%`,height:"100%",background:mod.color,borderRadius:3}}/></div>
              {mod.lessons.map((l,li)=>{const done=s.done.includes(l.id);const bm=(s.bookmarks||[]).includes(l.id);return(
                <div key={l.id} className="flex items-center gap-2 cursor-pointer" style={{padding:"7px 10px",borderRadius:12,marginBottom:3,background:done?"rgba(255,255,255,.5)":"#fff",border:"1px solid rgba(0,0,0,.03)"}} onClick={()=>openLesson(l)}>
                  <div className="flex items-center justify-center font-bold" style={{width:24,height:24,borderRadius:7,fontSize:10,background:done?mod.color:"#F5EDE5",color:done?"#fff":"#888"}}>{done?"✓":(li+1)}</div>
                  <div className="flex-1"><div className="text-xs font-semibold" style={{color:done?"#aaa":"#2D3436"}}>{l.t}</div><div style={{fontSize:8,color:"#bbb"}}>{l.xp} XP{s.notes?.[l.id]?" · 📝":""}</div></div>
                  <span onClick={e=>{e.stopPropagation();toggleBM(l.id)}} className="cursor-pointer text-xs">{bm?"⭐":"☆"}</span>
                  <div className="flex items-center justify-center" style={{width:24,height:24,borderRadius:12,background:done?"#F5EDE5":"#2D3436",color:done?"#aaa":"#fff",fontSize:10}}>{done?"↺":"→"}</div>
                </div>
              )})}
            </div>);
          })}
        </div>)}

        {/* LESSON CHAT */}
        {v==="lesson"&&aLes&&(<div className="flex flex-col h-screen">
          <div className="bg-white px-3 py-2.5 border-b shrink-0" style={{borderColor:"rgba(0,0,0,.06)"}}>
            <div className="flex items-center justify-between mx-auto" style={{maxWidth:520}}>
              <button onClick={()=>{setV("home");setALes(null);setMsgs([]);setTimerOn(false);setShowNote(false)}} className="text-xs text-gray-400 cursor-pointer bg-transparent border-none">← Back</button>
              <div className="text-center"><div className="font-bold text-xs">{aLes.t}</div><div className="text-xs text-gray-400">{aLes.xp} XP · {fmtTime(timer)}</div></div>
              <div className="flex gap-1">
                <button onClick={()=>setShowNote(!showNote)} className="border rounded-lg px-2 py-1 text-xs cursor-pointer bg-transparent" style={{borderColor:"#EDE7DF"}}>📝</button>
                {!s.done.includes(aLes.id)?(<button onClick={markDone} className="text-white text-xs font-bold rounded-lg px-2.5 py-1 cursor-pointer border-none" style={{background:"#00C853"}}>✓ Done</button>):(<span className="text-xs font-bold" style={{color:"#00C853"}}>✅</span>)}
              </div>
            </div>
          </div>

          {showNote&&(<div className="px-3 py-2 border-b shrink-0" style={{background:"#FFFDE7",borderColor:"rgba(0,0,0,.04)"}}><div className="mx-auto" style={{maxWidth:520}}><textarea value={note} onChange={e=>setNote(e.target.value)} onBlur={saveNote} placeholder="Your notes..." rows={3} className="w-full border rounded-lg p-2 text-xs outline-none resize-none bg-transparent" style={{borderColor:"#E8E0B0",fontFamily:"inherit"}}/></div></div>)}

          <div className="px-3 py-1.5 border-b shrink-0 overflow-x-auto" style={{background:"#FAFAFA",borderColor:"rgba(0,0,0,.03)"}}>
            <div className="mx-auto flex gap-1 items-center" style={{maxWidth:520}}>
              <span className="text-xs text-gray-400 shrink-0" style={{fontSize:9}}>Mode:</span>
              {MODES.map(m=>{const act=mode===m.id;return(<button key={m.id} onClick={()=>setMode(m.id)} className="shrink-0 cursor-pointer" style={{padding:"3px 8px",borderRadius:10,fontSize:8,fontWeight:600,border:`1px solid ${act?"#E07A42":"rgba(0,0,0,.05)"}`,background:act?"#FFF5EE":"#fff",color:act?"#E07A42":"#888"}}>{m.label}</button>)})}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2.5">
            <div className="mx-auto" style={{maxWidth:520}}>
              {msgs.map((msg,i)=>{const isU=msg.role==="user";return(
                <div key={i} className="flex mb-2" style={{justifyContent:isU?"flex-end":"flex-start",animation:"fu .15s"}}>
                  <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:isU?"16px 16px 4px 16px":"16px 16px 16px 4px",background:isU?"#2D3436":"#fff",color:isU?"#fff":"#2D3436",fontSize:12,lineHeight:1.6,boxShadow:isU?"none":"0 1px 3px rgba(0,0,0,.03)",border:isU?"none":"1px solid rgba(0,0,0,.03)",whiteSpace:"pre-wrap"}}>{msg.text}</div>
                </div>
              )})}
              {cld&&(<div className="flex mb-2"><div style={{padding:"10px 18px",borderRadius:"16px 16px 16px 4px",background:"#fff",border:"1px solid rgba(0,0,0,.03)",display:"flex",gap:3,alignItems:"center"}}>{[0,.2,.4].map(d=>(<span key={d} style={{width:5,height:5,borderRadius:3,background:"#ccc",animation:`blink 1s infinite ${d}s`}}/>))}</div></div>)}
              <div ref={chatEnd}/>
            </div>
          </div>

          <div className="px-3 py-1 border-t shrink-0" style={{background:"#FAFAFA",borderColor:"rgba(0,0,0,.03)"}}>
            <div className="mx-auto flex gap-1 overflow-x-auto pb-0.5" style={{maxWidth:520}}>
              {["Explain simpler","Give me code","Real example","Quiz me","What can I build?","Connect to HCL","Summarize","Deep dive"].map(q=>(<button key={q} onClick={()=>sendMsg(q)} className="shrink-0 cursor-pointer" style={{padding:"3px 8px",borderRadius:10,fontSize:8,border:"1px solid rgba(0,0,0,.05)",background:"#fff",color:"#888"}}>{q}</button>))}
            </div>
          </div>

          <div className="px-3 py-2 pb-4 bg-white border-t shrink-0" style={{borderColor:"rgba(0,0,0,.05)"}}>
            <div className="mx-auto flex gap-2" style={{maxWidth:520}}>
              <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}}} placeholder={`Ask about ${aLes.t}...`} className="flex-1 p-2.5 rounded-xl border text-xs outline-none" style={{borderColor:"#EDE7DF",background:"#FAFAFA",fontFamily:"inherit"}}/>
              <button onClick={()=>sendMsg()} disabled={cld} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base shrink-0 border-none" style={{background:cld?"#ccc":"#E07A42",cursor:cld?"wait":"pointer"}}>↑</button>
            </div>
          </div>
        </div>)}

        {/* CURIOSITY */}
        {v==="curiosity"&&(<div style={{animation:"fu .3s",paddingTop:8}}>
          <div style={{background:"linear-gradient(135deg,#2D3436,#636e72)",borderRadius:22,padding:"18px 16px",marginBottom:12,color:"#fff"}}><h2 className="text-lg font-extrabold mb-1">🔮 Curiosity Spark</h2><p className="text-xs opacity-70">Get inspired before you learn!</p></div>
          {CURIOSITY.map(cat=>{const isA=curC===cat.id;return(
            <div key={cat.id} className="mb-2">
              <div onClick={()=>doCuriosity(cat)} className="cursor-pointer" style={{background:"#fff",borderRadius:20,padding:"12px 14px",boxShadow:"0 2px 10px rgba(0,0,0,.04)",borderLeft:isA?"3px solid #E07A42":"3px solid transparent"}}>
                <div className="flex items-center justify-between">
                  <div><div className="text-xs font-bold">{cat.label}</div><div style={{fontSize:9,color:"#888",marginTop:1}}>{cat.desc}</div></div>
                  <div className="shrink-0 flex items-center justify-center" style={{width:28,height:28,borderRadius:14,background:isA?"#E07A42":"#F5EDE5",color:isA?"#fff":"#888",fontSize:12}}>{curL&&isA?"⏳":"→"}</div>
                </div>
              </div>
              {isA&&curL&&(<div className="px-2 py-1"><div className="shm"/><div className="shm"/><div className="shm"/></div>)}
              {isA&&!curL&&curR.length>0&&(<div className="pt-1">
                {curR.map((r: any,i: number)=>(<a key={i} href={r.url||"#"} target="_blank" rel="noopener noreferrer" className="block no-underline mb-1 ml-2" style={{padding:"8px 10px",background:"#FAFAFA",borderRadius:10,border:"1px solid rgba(0,0,0,.03)"}}><div className="flex items-center gap-1"><span style={{fontSize:9}}>{tI[r.type]||"📄"}</span><span className="text-xs font-semibold" style={{color:"#2D3436"}}>{r.title}</span></div><div style={{fontSize:8,color:"#888",marginTop:1,paddingLeft:12}}>{r.desc||""}</div></a>))}
                <button onClick={()=>doCuriosity(cat)} className="ml-2 mt-0.5 mb-1 cursor-pointer" style={{background:"#FFF5EE",border:"1px solid #F4D0B0",color:"#E07A42",padding:"3px 10px",borderRadius:8,fontSize:8,fontWeight:600}}>🔄 Refresh</button>
              </div>)}
            </div>
          )})}
        </div>)}

        {/* DISCOVER */}
        {v==="discover"&&(<div style={{animation:"fu .3s",paddingTop:8}}>
          <div style={{background:"linear-gradient(135deg,#E07A42,#F4A261)",borderRadius:22,padding:"16px 14px",marginBottom:10,color:"#fff"}}>
            <h2 className="text-base font-extrabold mb-1.5">🔍 Discover</h2>
            <div className="flex gap-1.5">
              <input value={sq} onChange={e=>setSq(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doSearch()}} placeholder="Search tools, repos…" className="flex-1 rounded-lg px-3 py-2 text-xs outline-none text-white" style={{background:"rgba(255,255,255,.22)",border:"none"}}/>
              <button onClick={doSearch} disabled={sld} className="shrink-0 rounded-lg px-3 py-2 font-bold text-xs cursor-pointer border-none" style={{background:"#fff",color:"#E07A42"}}>{sld?"⏳":"Go"}</button>
            </div>
          </div>
          {sld&&(<div>{[1,2,3].map(i=>(<div key={i} className="shm"/>))}</div>)}
          {sres.length>0&&(<div className="mb-2">{sres.map((r: any,i: number)=>(<a key={i} href={r.url||"#"} target="_blank" rel="noopener noreferrer" className="block no-underline mb-1" style={{background:"#fff",borderRadius:20,padding:9,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}><div className="flex items-center gap-1"><span>{tI[r.type]||"📄"}</span><span className="text-xs font-semibold">{r.title}</span></div><div style={{fontSize:8,color:"#888",marginTop:1,paddingLeft:12}}>{r.desc||""}</div></a>))}</div>)}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-2">{Object.keys(RES).map(t=>(<button key={t} onClick={()=>setTab(t)} className="shrink-0 cursor-pointer" style={{padding:"4px 10px",borderRadius:14,fontSize:9,fontWeight:600,border:`1px solid ${tab===t?"#E07A42":"rgba(0,0,0,.05)"}`,background:tab===t?"#FFF5EE":"#fff",color:tab===t?"#E07A42":"#888"}}>{t}</button>))}</div>
          {(RES[tab]||[]).map((r,i)=>(<a key={i} href={r.u} target="_blank" rel="noopener noreferrer" className="block no-underline mb-1" style={{background:"#fff",borderRadius:20,padding:9,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}><span className="text-xs font-semibold">{r.n}</span><span className="text-xs text-gray-400 ml-1.5">{r.d}</span></a>))}
        </div>)}

        {/* PROGRESS */}
        {v==="progress"&&(<div style={{animation:"fu .3s",paddingTop:8}}>
          <h2 className="text-xl font-extrabold mb-2.5">Progress</h2>
          <div style={{background:"#fff",borderRadius:20,padding:"12px 14px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
            <div className="flex gap-4 mb-2">
              <div><span className="text-2xl font-extrabold">{s.done.length}</span><span className="text-xs text-gray-400"> lessons</span></div>
              <div><span className="text-2xl font-extrabold">{Math.round(s.xp/60)}</span><span className="text-xs text-gray-400"> hours</span></div>
              <div><span className="text-2xl font-extrabold">L{s.lv}</span></div>
            </div>
            {days.map((d,i)=>{const val=(s.weekXp||[])[i]||0;const w=mxW>0?Math.max(val/mxW*100,4):4;return(
              <div key={i} className="flex items-center gap-1.5 mb-0.5"><span style={{fontSize:8,color:"#888",width:20}}>{d}</span><div className="flex-1 rounded" style={{background:"#F5EDE5",height:14}}><div style={{width:`${w}%`,height:"100%",background:i===new Date().getDay()?"#E07A42":"#D4C5B0",borderRadius:5}}/></div>{val>0&&(<span style={{fontSize:7,fontWeight:700,color:"#fff",background:"#E07A42",borderRadius:5,padding:"0 4px"}}>{val}</span>)}</div>
            )})}
          </div>
          {[["XP",s.xp,"#E07A42"],["Streak",s.str+"d","#FF6B35"],["Done",pct+"%","#00C853"],["Curious",s.curious||0,"#7C6AE8"]].map(([label,val,color],i)=>(
            <div key={i} className="flex justify-between mb-1" style={{background:"#fff",borderRadius:20,padding:"8px 12px",boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}><span className="text-xs text-gray-400">{label as string}</span><span className="text-sm font-extrabold" style={{color:color as string}}>{val}</span></div>
          ))}
          <div className="flex gap-1.5 mt-3">
            <button onClick={logout} className="flex-1 py-2 text-xs font-semibold text-gray-400 cursor-pointer text-center" style={{background:"#fff",borderRadius:20,border:"1px solid rgba(0,0,0,.04)"}}>Logout</button>
            <button onClick={()=>{if(confirm("Reset?"))save(INIT)}} className="flex-1 py-2 text-xs font-semibold cursor-pointer" style={{background:"#FFF0E5",border:"1px solid #F4D0B0",color:"#E07A42",borderRadius:20}}>Reset</button>
          </div>
        </div>)}

        </div>

        {v!=="lesson"&&(<div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1.5">
          <div className="mx-auto flex justify-around" style={{maxWidth:520,background:"#2D3436",borderRadius:20,padding:"5px 3px",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
            {([["home","🏠","Home"],["curiosity","🔮","Curiosity"],["discover","🔍","Discover"],["progress","📊","Progress"]] as const).map(([id,ic,lb])=>{const act=v===id;return(
              <button key={id} onClick={()=>setV(id)} className="flex flex-col items-center cursor-pointer border-none" style={{background:act?"#E07A42":"transparent",padding:"5px 12px",borderRadius:14,color:act?"#fff":"#888"}}>
                <span className="text-sm">{ic}</span><span style={{fontSize:7,fontWeight:act?700:400}}>{lb}</span>
              </button>
            )})}
          </div>
        </div>)}
      </div>)}
    </div>
  );
};

export default Index;
