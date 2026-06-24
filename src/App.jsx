import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
 
/* ═══ CONSTANTS ═══ */
const TERPENES=["Myrcene","Limonene","Caryophyllene","Linalool","Pinene","Humulene","Terpinolene","Ocimene","Bisabolol","Valencene","Nerolidol","Guaiol","Camphene","Geraniol","Eucalyptol"];
const VIBE_CATEGORIES={
  "🏃":["Bed mode","Couch-locked","Clean mode","Get things done","Restless"],
  "🧠":["Deep thinking","Creative flow","Music dive","Zoned out","Laser focused"],
  "💬":["Conversational","Giggly","Hang out","Quiet mode"],
  "✨":["Munchies","Music hits different","Body high","Pain relief","Full-body euphoria","Horny","Connected to nature","Dream-inducing","Funny inner-dialogue"],
  "📊":["Uplifted","Cozy","Sleepy","Energized","Anxious","Paranoid","IDGAF mode"],
  "👅":["Earthy","Citrus","Pine","Sweet","Gassy","Skunky","Floral","Peppery","Berry","Diesel","Tropical","Minty","Woody","Spicy"]
};
const VIBE_TAGS=Object.values(VIBE_CATEGORIES).flat();
const P={bg:"#F5F0E8",card:"#FFFCF7",surface:"#EDE8DC",border:"#E8E0D0",borderDark:"#D4CABC",text:"#3A3228",textMuted:"#8C7E6A",textWarm:"#6B5D49",sage:"#6B7F5A",sageMid:"#7D9168",terracotta:"#C17F4A",terracottaLight:"#FFF3E8",cream:"#FFFCF7",plum:"#8B6D8B",plumLight:"#F0EAF0",plumBorder:"#C4B0C4",red:"#C15A4A",redLight:"#FDEEEC",sativa:"#C9A84C",indica:"#7B6B9E",onHand:"#5B8A72",onHandLight:"#EBF5EF"};
const typeColor=t=>({"Sativa":P.sativa,"Indica":P.indica,"Hybrid":P.sage}[t]||P.textMuted);
const copAgainColor=v=>({"Yes":P.sage,"Maybe":P.terracotta,"No":P.textMuted,"Never again":P.red}[v]||P.textMuted);
const today=()=>new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
 
/* ═══ COMPONENTS ═══ */
const Leaf=({filled,color=P.sage,size=20})=>(<svg width={size} height={size} viewBox="0 0 28 28"><path d="M14 4c-1 0-3 2-3 6s4 10 3 14c4-2 8-6 8-12S18 4 14 4z" fill={filled?color:P.border}/><path d="M14 4c1 0 3 2 3 6s-4 10-3 14c-4-2-8-6-8-12S10 4 14 4z" fill={filled?(color===P.sage?P.sageMid:color===P.plum?"#A585A5":"#D4956A"):P.surface}/></svg>);
const Pill=({children,active,color=P.sage,onClick,removable,style:s})=>(<button onClick={onClick} style={{fontSize:12,padding:"5px 12px",borderRadius:14,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",transition:"all 0.15s",background:active?color:P.bg,color:active?P.cream:P.textMuted,border:active?"none":`0.5px solid ${P.border}`,...s}}>{children}{removable&&active&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke={P.cream} strokeWidth="1.2" strokeLinecap="round"/></svg>}</button>);
const TypeBadge=({type})=>(<div style={{width:4,borderRadius:2,background:typeColor(type),flexShrink:0,alignSelf:"stretch"}}/>);
const SectionLabel=({children})=>(<p style={{fontSize:12,fontWeight:500,color:P.textMuted,letterSpacing:0.5,margin:"0 0 10px"}}>{children}</p>);
const BackBtn=({onClick})=>(<button onClick={onClick} style={{width:36,height:36,borderRadius:"50%",background:P.surface,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1L1 10M1 10h6M1 10V4" stroke={P.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>);
const Wrapper=({children})=>(<div style={{background:P.bg,minHeight:"100vh",fontFamily:"'DM Sans','Nunito',sans-serif",padding:20}}><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet"/><div style={{maxWidth:480,margin:"0 auto"}}>{children}</div></div>);
 
const ToggleGroup=({options,value,onChange,color=P.sage})=>(<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{options.map(o=>(<button key={o} onClick={()=>onChange(o)} style={{flex:options.length<=4?1:undefined,padding:"10px 14px",borderRadius:8,fontSize:13,fontFamily:"inherit",cursor:"pointer",transition:"all 0.15s",fontWeight:value===o?500:400,background:value===o?color:P.bg,color:value===o?P.cream:P.textMuted,border:value===o?"none":`0.5px solid ${P.border}`}}>{o==="TL"?"TL":o}</button>))}</div>);
const SubToggle=({options,value,onChange,color=P.sage,label="hybrid lean:"})=>(<div style={{paddingLeft:12,borderLeft:`2px solid ${color}`,marginTop:8}}><p style={{fontSize:11,color:P.textMuted,margin:"0 0 6px"}}>{label}</p><div style={{display:"flex",gap:6}}>{options.map(o=>(<button key={o} onClick={()=>onChange(o)} style={{flex:1,padding:8,borderRadius:6,fontSize:12,fontFamily:"inherit",cursor:"pointer",fontWeight:value===o?500:400,background:value===o?color:P.bg,color:value===o?P.cream:P.textMuted,border:value===o?"none":`0.5px solid ${P.border}`,transition:"all 0.15s"}}>{o.toLowerCase()}</button>))}</div></div>);
 
const SpectrumSlider=({left,right,value,onChange,color=P.plum})=>{
  const labels={[-3]:`deeply ${left.toLowerCase()}`,[-2]:left.toLowerCase(),[-1]:`leaning ${left.toLowerCase()}`,[0]:"neutral",[1]:`leaning ${right.toLowerCase()}`,[2]:right.toLowerCase(),[3]:`deeply ${right.toLowerCase()}`};
  return(<div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:P.text,fontWeight:500}}>{left.toLowerCase()}</span><span style={{fontSize:12,color:P.text,fontWeight:500}}>{right.toLowerCase()}</span></div><div style={{display:"flex",gap:4}}>{[-3,-2,-1,0,1,2,3].map(n=>(<button key={n} onClick={()=>onChange(n)} style={{flex:1,height:34,borderRadius:7,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",background:value===n?color:P.bg,border:value===n?"none":`0.5px solid ${P.border}`,opacity:value===n?1:(Math.abs(n)===3?0.9:1)}}><div style={{width:value===n?(Math.abs(n)===3?16:12):5,height:value===n?(Math.abs(n)===3?16:12):5,borderRadius:"50%",margin:"0 auto",background:value===n?P.cream:P.borderDark,transition:"all 0.15s"}}/></button>))}</div><p style={{fontSize:11,color:P.textMuted,textAlign:"center",margin:"5px 0 0"}}>{labels[value]||"neutral"}</p></div>);
};
const SpectrumDisplay=({left,right,val,color})=>(<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:P.textMuted,marginBottom:3}}><span>{left.toLowerCase()}</span><span>{right.toLowerCase()}</span></div><div style={{display:"flex",gap:3}}>{[-3,-2,-1,0,1,2,3].map(n=>(<div key={n} style={{flex:1,height:20,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:val===n?color:P.bg,border:val===n?"none":`0.5px solid ${P.border}`}}><div style={{width:val===n?(Math.abs(n)===3?10:7):3,height:val===n?(Math.abs(n)===3?10:7):3,borderRadius:"50%",background:val===n?P.cream:P.borderDark}}/></div>))}</div></div>);
 
const TerpeneSelector=({selected,onChange})=>{
  const[search,setSearch]=useState("");const[open,setOpen]=useState(false);
  const filtered=TERPENES.filter(t=>!selected.includes(t)&&t.toLowerCase().includes(search.toLowerCase()));
  return(<div style={{position:"relative"}}><div style={{background:P.bg,borderRadius:8,padding:"10px 14px",border:`0.5px solid ${P.border}`,display:"flex",alignItems:"center"}}><input value={search} onChange={e=>{setSearch(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="search terpenes..." style={{border:"none",background:"transparent",flex:1,fontSize:14,color:P.text,outline:"none",fontFamily:"inherit"}}/></div>{selected.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{selected.map(t=><Pill key={t} active color={P.sage} removable onClick={()=>onChange(selected.filter(x=>x!==t))}>{t.toLowerCase()}</Pill>)}</div>}{open&&search&&filtered.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:10,background:P.card,border:`0.5px solid ${P.border}`,borderRadius:8,marginTop:4,maxHeight:150,overflowY:"auto"}}>{filtered.slice(0,6).map(t=><button key={t} onClick={()=>{onChange([...selected,t]);setSearch("");setOpen(false);}} style={{display:"block",width:"100%",padding:"8px 14px",fontSize:13,color:P.text,background:"transparent",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit"}} onMouseOver={e=>e.target.style.background=P.bg} onMouseOut={e=>e.target.style.background="transparent"}>{t.toLowerCase()}</button>)}</div>}</div>);
};
const TagSelector=({tags,categories,selected,onChange,color=P.terracotta})=>{
  const[ci,setCi]=useState("");const[adding,setAdding]=useState(false);const[openCat,setOpenCat]=useState(null);
  const allTags=[...(tags||[]),...selected.filter(s=>!(tags||[]).includes(s)&&!Object.values(categories||{}).flat().includes(s))];
  const toggle=t=>onChange(selected.includes(t)?selected.filter(x=>x!==t):[...selected,t]);
  if(categories){
    const catEntries=Object.entries(categories);
    const customTags=selected.filter(s=>!Object.values(categories).flat().includes(s));
    return(<div>
      {selected.length>0&&<div style={{marginBottom:10}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{selected.map(t=><Pill key={t} active color={color} removable onClick={()=>toggle(t)}>{t.toLowerCase()}</Pill>)}</div>
      </div>}
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {catEntries.map(([cat])=><button key={cat} onClick={()=>setOpenCat(openCat===cat?null:cat)} style={{padding:"6px 12px",borderRadius:8,fontSize:11,fontFamily:"inherit",cursor:"pointer",background:openCat===cat?P.text:P.bg,color:openCat===cat?P.cream:P.textMuted,border:openCat===cat?"none":`0.5px solid ${P.border}`,fontWeight:openCat===cat?500:400}}>{cat}</button>)}
      </div>
      {openCat&&<div style={{background:P.card,borderRadius:10,padding:12,border:`0.5px solid ${P.border}`,marginBottom:10}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {(categories[openCat]||[]).map(t=><Pill key={t} active={selected.includes(t)} color={color} onClick={()=>toggle(t)}>{t.toLowerCase()}</Pill>)}
        </div>
      </div>}
      <div style={{display:"flex",gap:5}}>{!adding&&<Pill onClick={()=>setAdding(true)} style={{borderStyle:"dashed",fontStyle:"italic"}}>+ custom</Pill>}{adding&&<><input value={ci} onChange={e=>setCi(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"&&ci.trim()){onChange([...selected,ci.trim()]);setCi("");setAdding(false);}if(e.key==="Escape"){setCi("");setAdding(false);}}} placeholder="type & enter" style={{fontSize:12,padding:"5px 10px",borderRadius:14,border:`0.5px solid ${P.border}`,background:P.bg,outline:"none",fontFamily:"inherit",width:100}}/><Pill onClick={()=>{if(ci.trim())onChange([...selected,ci.trim()]);setCi("");setAdding(false);}} color={color} active>add</Pill></>}</div>
    </div>);
  }
  return(<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{allTags.map(t=><Pill key={t} active={selected.includes(t)} color={color} onClick={()=>toggle(t)}>{t.toLowerCase()}</Pill>)}{!adding&&<Pill onClick={()=>setAdding(true)} style={{borderStyle:"dashed",fontStyle:"italic"}}>+ custom</Pill>}{adding&&<><input value={ci} onChange={e=>setCi(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"&&ci.trim()){onChange([...selected,ci.trim()]);setCi("");setAdding(false);}if(e.key==="Escape"){setCi("");setAdding(false);}}} placeholder="type & enter" style={{fontSize:12,padding:"5px 10px",borderRadius:14,border:`0.5px solid ${P.border}`,background:P.bg,outline:"none",fontFamily:"inherit",width:100}}/><Pill onClick={()=>{if(ci.trim())onChange([...selected,ci.trim()]);setCi("");setAdding(false);}} color={color} active>add</Pill></>}</div>);
};
 
/* ═══ DEMO DATA — STRAIN → COP(s) ═══ */
const INIT_STRAINS=[];
 
 
/* ═══ MAIN APP ═══ */
export default function TheCloud({initialData={},onDataChange}){
  const[tab,setTab]=useState("active");
  const[view,setView]=useState(null);
  const[strains,setStrains]=useState(()=>initialData.strains||INIT_STRAINS);
  const[legacyStrains,setLegacyStrains]=useState([
    {id:"L1",name:"Oreoz",type:"Indica",copAgain:"Yes",notes:"sleepy, giggly, funny high. feel it in the eyes"},
    {id:"L2",name:"Snow G",type:"",copAgain:"Yes",notes:"sativa dominant hybrid vibe. good high for chillin but not sleeping"},
    {id:"L3",name:"Runtz Mintz",type:"Indica",copAgain:"Yes",notes:""},
    {id:"L4",name:"Trop Cherry",type:"Hybrid",copAgain:"Yes",notes:"lazy body, active mind"},
    {id:"L5",name:"Cereal Milk",type:"",copAgain:"Yes",notes:"great taste and smell"},
    {id:"L6",name:"Lemonatti",type:"",copAgain:"Yes",notes:""},
    {id:"L7",name:"GlueChee",type:"",copAgain:"Yes",notes:""},
    {id:"L8",name:"Gello",type:"",copAgain:"Yes",notes:""},
    {id:"L9",name:"MAC",type:"",copAgain:"Yes",notes:""},
    {id:"L10",name:"Garlic Aioli",type:"",copAgain:"Yes",notes:""},
    {id:"L11",name:"Red Rum",type:"",copAgain:"Yes",notes:""},
    {id:"L12",name:"Ice Cream Cake",type:"",copAgain:"Yes",notes:""},
    {id:"L13",name:"Biscotti Cookies",type:"",copAgain:"Yes",notes:""},
    {id:"L14",name:"Jack Herer",type:"",copAgain:"Yes",notes:""},
    {id:"L15",name:"Mendo Breath",type:"",copAgain:"Yes",notes:""},
    {id:"L16",name:"Jokerz Candy",type:"",copAgain:"Yes",notes:""},
    {id:"L17",name:"Crenshaw Melon",type:"",copAgain:"Yes",notes:""},
    {id:"L18",name:"Gas Face",type:"",copAgain:"Yes",notes:""},
    {id:"L19",name:"Modified Grapes",type:"Indica",copAgain:"Yes",notes:""},
    {id:"L20",name:"LA Confidential",type:"",copAgain:"Yes",source:"TL",notes:"high is giggly, horny, good, hazy"},
    {id:"L21",name:"Medellin",type:"",copAgain:"Yes",notes:"not for sleeping, but great for productivity while still feeling high"},
    {id:"L22",name:"Delicata Grapes",type:"",copAgain:"Yes",notes:"put the blunt down halfway type shit. deep lovely INDICA vibes."},
    {id:"L23",name:"Blueberry Haze",type:"",copAgain:"Yes",source:"TL",notes:"my favorite productive strain ever"},
    {id:"L24",name:"Cake Batter",type:"",copAgain:"Maybe",notes:""},
    {id:"L25",name:"Kush Mint",type:"",copAgain:"Maybe",notes:""},
    {id:"L26",name:"Purple Punch",type:"",copAgain:"Maybe",notes:""},
    {id:"L27",name:"Sherbert",type:"",copAgain:"Never again",notes:""},
    {id:"L28",name:"Tropical Runtz",type:"",copAgain:"Never again",notes:""},
    {id:"L29",name:"Ooh La La",type:"",copAgain:"Yes",notes:"great outdoor strain"},
    {id:"L30",name:"God\'s Gift",type:"",copAgain:"Yes",notes:""},
    {id:"L31",name:"Pina Colada",type:"",copAgain:"Yes",source:"Dispensary",container:"Bag",brand:"So Dope",notes:"smoked outside and it was the best mix of chill and euphoria"},
  ]);
  // Active entries: copped but no session yet
  const[coppedEntries,setCoppedEntries]=useState(()=>initialData.coppedEntries||[]);
  // On hand: smoked, still have some
  const[onHand,setOnHand]=useState(()=>initialData.onHand||[]);
  // Mix queue: mixes waiting for review
  const[mixQueue,setMixQueue]=useState(()=>initialData.mixQueue||[]);
  const[reups,setReups]=useState(()=>initialData.reups||[]);
  const[finishedReups,setFinishedReups]=useState(()=>initialData.finishedReups||[]);
  const[selectingReup,setSelectingReup]=useState(false);
  const[activeReupId,setActiveReupId]=useState(null);
  const[libSubTab,setLibSubTab]=useState("strains");
 
  // Form states
  const[cop,setCop]=useState({name:"",type:"",lean:"",source:"",container:"",brand:"",growType:"",terpenes:[],parent1:"",parent2:"",notes:"",existingStrainId:null});
  const[showSugg,setShowSugg]=useState(false);
  const[editEntry,setEditEntry]=useState(null);
  const[session,setSession]=useState({rating:0,smokesLike:"",smokesLikeLean:"",sw:0,sf:0,pull:0,setting:"indoor",bedtime:false,tasteTags:[],vibeTags:[],notes:"",copAgain:""});
  const[detailStrain,setDetailStrain]=useState(null);
  const[detailCopIdx,setDetailCopIdx]=useState(0);
  const[mixMode,setMixMode]=useState(null);
  const[mixWith,setMixWith]=useState(null);
  const[mixSess,setMixSess]=useState({rating:0,sw:0,sf:0,pull:0,bedtime:false,vibeTags:[],notes:""});
  const[updateNote,setUpdateNote]=useState("");
  const[expNote,setExpNote]=useState({note:"",setting:"indoor",bedtime:false,vibeTags:[]});
  const[expMix,setExpMix]=useState({active:false,strain:null});
  const[searchQ,setSearchQ]=useState("");
  const[searchSubTab,setSearchSubTab]=useState("starred");
  const[editingParents,setEditingParents]=useState(null);
  const[finishingCop,setFinishingCop]=useState(null);
  const[finishCopAgain,setFinishCopAgain]=useState("");
  const[showGuide,setShowGuide]=useState(false);
  const[showMore,setShowMore]=useState(false);
  const[showMore2,setShowMore2]=useState(false);
  const[editingItem,setEditingItem]=useState(null);
  const[editText,setEditText]=useState("");
  const[insightTab,setInsightTab]=useState("terpenes");
  const[insightMode,setInsightMode]=useState("pure");
  const[filters,setFilters]=useState({copAgain:"",minRating:0,month:""});
 
  // Sync to Supabase whenever persistent data changes
  useEffect(()=>{
    if(onDataChange)onDataChange({strains,coppedEntries,onHand,mixQueue,reups,finishedReups});
  },[strains,coppedEntries,onHand,mixQueue,reups,finishedReups]);
 
  const reset=(what)=>{
    if(what==="cop")setCop({name:"",type:"",lean:"",source:"",container:"",brand:"",growType:"",terpenes:[],parent1:"",parent2:"",notes:"",existingStrainId:null});
    if(what==="session")setSession({rating:0,smokesLike:"",smokesLikeLean:"",sw:0,sf:0,pull:0,setting:"indoor",bedtime:false,tasteTags:[],vibeTags:[],notes:"",copAgain:""});
    if(what==="mix"){setMixMode(null);setMixWith(null);setMixSess({rating:0,sw:0,sf:0,pull:0,bedtime:false,vibeTags:[],notes:""});setUpdateNote("");setExpNote({note:"",setting:"indoor",bedtime:false,vibeTags:[]});setExpMix({active:false,strain:null});}
  };
 
  // Helpers
  const getLatestCop=s=>s.cops[s.cops.length-1];
  const getLatestSession=s=>{const c=getLatestCop(s);return c?.session||null;};
  const isNeverAgain=s=>s.cops.some(c=>c.session?.copAgain==="Never again");
  const typeSummary=s=>{const types=[...new Set(s.cops.map(c=>c.type).filter(Boolean))];return types.length===1?types[0].toLowerCase():types.map(t=>t.toLowerCase()).join(" / ");};
  const allSessionCops=strains.flatMap(s=>s.cops.filter(c=>c.session).map(c=>({...c,strain:s})));
  const nameSuggs=cop.name.length>0?strains.filter(s=>s.name.toLowerCase().includes(cop.name.toLowerCase())):[];
  const legacySuggs=cop.name.length>0?legacyStrains.filter(l=>l.name.toLowerCase().includes(cop.name.toLowerCase())&&!nameSuggs.some(s=>s.name.toLowerCase()===l.name.toLowerCase())):[];
  const fmtSource=s=>s==="TL"?"TL":s?.toLowerCase();
 
  // Library search/filter
  const starredStrains=strains.filter(s=>s.starred&&!isNeverAgain(s)&&!s.legacy);
 
  const textSearchResults=strains.filter(s=>{
    if(!searchQ.trim())return false;
    if(s.legacy)return false;
    const q=searchQ.toLowerCase();
    if(s.name.toLowerCase().includes(q))return true;
    if(s.parents?.some(p=>p.toLowerCase().includes(q)))return true;
    return s.cops.some(c=>{
      if(c.terpenes?.some(t=>t.toLowerCase().includes(q)))return true;
      if(c.session?.tasteTags?.some(t=>t.toLowerCase().includes(q)))return true;
      if(c.session?.vibeTags?.some(t=>t.toLowerCase().includes(q)))return true;
      if(c.session?.notes?.toLowerCase().includes(q))return true;
      if(c.notes?.some(n=>n.text?.toLowerCase().includes(q)))return true;
      if(c.experiences?.some(e=>e.note?.toLowerCase().includes(q)||e.vibeTags?.some(t=>t.toLowerCase().includes(q))))return true;
      if(c.mixes?.some(m=>m.notes?.toLowerCase().includes(q)||m.withStrain?.toLowerCase().includes(q)||m.vibeTags?.some(t=>t.toLowerCase().includes(q))||m.combinedTerpenes?.some(t=>t.toLowerCase().includes(q))))return true;
      return false;
    });
  });
 
  // Available months from all cop dates
  const availableMonths=[...new Set(strains.flatMap(s=>s.cops.map(c=>c.date)).filter(Boolean).map(d=>{const parts=d.split(" ");return parts[0];}))].sort((a,b)=>{const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return months.indexOf(a)-months.indexOf(b);});
 
  const filteredStrains=strains.filter(s=>{
    if(s.legacy)return false;
    const ls=getLatestSession(s);if(!ls)return false;
    if(filters.copAgain&&ls.copAgain!==filters.copAgain)return false;
    if(filters.minRating&&ls.rating<filters.minRating)return false;
    if(filters.month&&!s.cops.some(c=>c.date?.startsWith(filters.month)))return false;
    return true;
  });
 
  // Terpene insights
  const terpAgg={};allSessionCops.forEach(c=>{c.terpenes.forEach(t=>{if(!terpAgg[t])terpAgg[t]={total:0,count:0,copYes:0};terpAgg[t].total+=c.session.rating;terpAgg[t].count++;if(c.session.copAgain==="Yes")terpAgg[t].copYes++;});});
  const terpRanked=Object.entries(terpAgg).map(([name,d])=>({name,avg:d.total/d.count,copPct:Math.round((d.copYes/d.count)*100)})).sort((a,b)=>b.avg-a.avg);
 
  // Mix insight data
  const allMixes=strains.flatMap(s=>s.cops.flatMap(c=>(c.mixes||[]).filter(m=>m.status==="reviewed").map(m=>({...m,strain:s,cop:c}))));
  const mixTerpAgg={};allMixes.forEach(m=>{(m.combinedTerpenes||[]).forEach(t=>{if(!mixTerpAgg[t])mixTerpAgg[t]={total:0,count:0};mixTerpAgg[t].total+=m.rating;mixTerpAgg[t].count++;});});
  const mixTerpRanked=Object.entries(mixTerpAgg).map(([name,d])=>({name,avg:d.total/d.count,copPct:0})).sort((a,b)=>b.avg-a.avg);
  const mixTypeData=(()=>{const td={};allMixes.forEach(m=>{[m.primaryType,m.withType].filter(Boolean).forEach(t=>{if(!td[t])td[t]={count:0,total:0};td[t].count++;td[t].total+=m.rating;});});return Object.entries(td).map(([name,d])=>({name,count:d.count,avg:+(d.total/d.count).toFixed(1)}));})();
 
  // Type breakdown data
  const typeData=(()=>{const td={};allSessionCops.forEach(c=>{const t=c.type||"Unknown";if(!td[t])td[t]={count:0,total:0};td[t].count++;td[t].total+=c.session.rating;});return Object.entries(td).map(([name,d])=>({name,count:d.count,avg:+(d.total/d.count).toFixed(1)}));})();
  const typeColors={"Sativa":P.sativa,"Indica":P.indica,"Hybrid":P.sage,"Unknown":P.textMuted};
 
  const activeTerpRanked=insightMode==="pure"?terpRanked:mixTerpRanked;
  const activeTypeData=insightMode==="pure"?typeData:mixTypeData;
  const activeTotal=insightMode==="pure"?allSessionCops.length:allMixes.length;
 
  // Outdoor data
  const outdoorSessions=allSessionCops.filter(c=>c.session.setting==="outdoor"||strains.find(s=>s.id===c.strainId)?.intent==="adventure");
  const indoorSessions=allSessionCops.filter(c=>c.session.setting==="indoor");
  const outdoorAvg=outdoorSessions.length?+(outdoorSessions.reduce((a,c)=>a+c.session.rating,0)/outdoorSessions.length).toFixed(1):0;
  const indoorAvg=indoorSessions.length?+(indoorSessions.reduce((a,c)=>a+c.session.rating,0)/indoorSessions.length).toFixed(1):0;
  const outdoorExps=strains.flatMap(s=>s.cops.flatMap(c=>(c.experiences||[]).filter(e=>e.setting==="outdoor").map(e=>({...e,strain:s.name,terpenes:c.terpenes}))));
  const outdoorTerpAgg={};[...outdoorSessions,...outdoorExps.map(e=>({terpenes:e.terpenes,session:{rating:5}}))].forEach(c=>{(c.terpenes||[]).forEach(t=>{if(!outdoorTerpAgg[t])outdoorTerpAgg[t]={count:0,total:0};outdoorTerpAgg[t].count++;outdoorTerpAgg[t].total+=(c.session?.rating||4);});});
  const outdoorTerpRanked=Object.entries(outdoorTerpAgg).map(([name,d])=>({name,count:d.count,avg:+(d.total/d.count).toFixed(1)})).sort((a,b)=>b.count-a.count);
  const outdoorVibes={};[...outdoorSessions.flatMap(c=>c.session.vibeTags||[]),...outdoorExps.flatMap(e=>e.vibeTags||[])].forEach(v=>{outdoorVibes[v]=(outdoorVibes[v]||0)+1;});
  const outdoorVibeRanked=Object.entries(outdoorVibes).sort((a,b)=>b[1]-a[1]);
 
  // Brand insights
  const brandAgg={};allSessionCops.filter(c=>c.source==="Dispensary"&&c.brand).forEach(c=>{if(!brandAgg[c.brand])brandAgg[c.brand]={count:0,total:0,yes:0};brandAgg[c.brand].count++;brandAgg[c.brand].total+=c.session.rating;if(c.session.copAgain==="Yes")brandAgg[c.brand].yes++;});
  const brandRanked=Object.entries(brandAgg).map(([name,d])=>({name,count:d.count,avg:+(d.total/d.count).toFixed(1),copPct:Math.round((d.yes/d.count)*100)})).sort((a,b)=>b.avg-a.avg);
 
  /* ═══ HANDLERS ═══ */
  const handleSelectExisting=strain=>{setCop({...cop,name:strain.name,type:getLatestCop(strain).type||"",lean:getLatestCop(strain).lean||"",parent1:strain.parents?.[0]||"",parent2:strain.parents?.[1]||"",existingStrainId:strain.id});setShowSugg(false);};
 
  const handleSaveCop=()=>{
    if(!cop.name.trim())return;
    const newId=Date.now();
    setCoppedEntries([{id:newId,strainName:cop.name.trim(),strainId:cop.existingStrainId,reupId:activeReupId,type:cop.type,lean:cop.lean,source:cop.source,container:cop.container,brand:cop.brand,growType:cop.growType,terpenes:[...cop.terpenes],parent1:cop.parent1,parent2:cop.parent2,date:today(),firstNotes:cop.notes},...coppedEntries]);
    if(activeReupId){
      setReups(reups.map(r=>r.id!==activeReupId?r:{...r,coppedIds:[...(r.coppedIds||[]),newId]}));
    }
    reset("cop");setActiveReupId(null);setView(null);
  };
 
  const handleSaveSession=()=>{
    if(!editEntry)return;
    
    const copId=Date.now();
    const strainId=editEntry.strainId||copId+1;
    const newCop={id:copId,type:editEntry.type,lean:editEntry.lean,source:editEntry.source,container:editEntry.container,brand:editEntry.brand||"",growType:editEntry.growType||"",terpenes:[...editEntry.terpenes],date:editEntry.date,firstNotes:editEntry.firstNotes,status:session.copAgain==="Never again"?"done":"on-hand",
      session:{rating:session.rating,smokesLike:session.smokesLike,smokesLikeLean:session.smokesLikeLean,setting:session.setting,bedtime:session.bedtime,spectrums:{sw:session.sw,sf:session.sf},pull:session.pull,tasteTags:[...session.tasteTags],vibeTags:[...session.vibeTags],notes:session.notes,copAgain:session.copAgain},
      experiences:[],mixes:[],notes:[]};
    if(editEntry.strainId){
      setStrains(strains.map(s=>s.id!==editEntry.strainId?s:{...s,cops:[...s.cops,newCop]}));
    }else{
      setStrains([{id:strainId,name:editEntry.strainName,parents:[editEntry.parent1,editEntry.parent2].filter(Boolean),cops:[newCop]},...strains]);
    }
    // Update re-up: swap coppedId for the new copId
    if(editEntry.reupId){
      setReups(reups.map(r=>r.id!==editEntry.reupId?r:{...r,coppedIds:(r.coppedIds||[]).filter(id=>id!==editEntry.id),copIds:[...r.copIds,copId]}));
    }
    // Move to on-hand
    setOnHand([{strainName:editEntry.strainName,strainId:strainId,copId:copId,type:editEntry.type,terpenes:[...editEntry.terpenes],date:editEntry.date,rating:session.rating},...onHand]);
    setCoppedEntries(coppedEntries.filter(e=>e.id!==editEntry.id));
    reset("session");setEditEntry(null);setView(null);
  };
 
  const handleMarkDone=item=>{
    setFinishingCop(item);setFinishCopAgain("");
  };
  const handleConfirmDone=()=>{
    if(!finishingCop)return;
    const fc=finishingCop;
    const newOnHand=onHand.filter(o=>o.copId!==fc.copId);
    const newStrains=strains.map(s=>s.id!==fc.strainId?s:{...s,cops:s.cops.map(c=>c.id!==fc.copId?c:{...c,status:"done",finishedDate:today(),session:{...c.session,copAgain:finishCopAgain||c.session.copAgain}})});
    setOnHand(newOnHand);
    setStrains(newStrains);
    if(detailStrain?.id===fc.strainId){
      setDetailStrain(newStrains.find(s=>s.id===fc.strainId));
    }
    // Check if any re-up is now fully closed
    const reupForCop=reups.find(r=>r.copIds.includes(fc.copId));
    if(reupForCop){
      const allDone=reupForCop.copIds.every(cId=>{
        const cop=newStrains.flatMap(s=>s.cops).find(c=>c.id===cId);
        return cop?.status==="done";
      });
      const noPending=(reupForCop.coppedIds||[]).length===0;
      if(allDone&&noPending){
        // Close re-up and move to finishedReups
        const finishedReup={...reupForCop,closed:true,closedDate:today(),strainNames:reupForCop.copIds.map(cId=>{const cop=newStrains.flatMap(s=>s.cops).find(c=>c.id===cId);const strain=newStrains.find(s=>s.cops.some(c=>c.id===cId));return strain?.name;}).filter(Boolean)};
        setFinishedReups([finishedReup,...finishedReups].slice(0,5));
        setReups(reups.filter(r=>r.id!==reupForCop.id));
      }
    }
    setFinishingCop(null);setFinishCopAgain("");
  };
 
  const openDetail=s=>{setDetailStrain(s);setDetailCopIdx(s.cops.length-1);setView("detail");reset("mix");setEditingParents(null);setShowMore(false);setShowMore2(false);};
  const handleSaveParents=(p1,p2)=>{
    const parents=[p1,p2].filter(Boolean);
    const updated=strains.map(s=>s.id!==detailStrain.id?s:{...s,parents});
    setStrains(updated);setDetailStrain({...detailStrain,parents});setEditingParents(null);
  };
 
  const toggleStar=()=>{
    if(!detailStrain||isNeverAgain(detailStrain))return;
    const newStarred=!detailStrain.starred;
    const updated=strains.map(s=>s.id!==detailStrain.id?s:{...s,starred:newStarred});
    setStrains(updated);setDetailStrain({...detailStrain,starred:newStarred});
  };
 
  const toggleUnknownLineage=()=>{
    if(!detailStrain)return;
    const newVal=!detailStrain.unknownLineage;
    const updated=strains.map(s=>s.id!==detailStrain.id?s:{...s,unknownLineage:newVal});
    setStrains(updated);setDetailStrain({...detailStrain,unknownLineage:newVal});
  };
 
  const setStrainIntent=(intent)=>{
    if(!detailStrain||detailStrain.intent)return;
    const updated=strains.map(s=>s.id!==detailStrain.id?s:{...s,intent});
    setStrains(updated);setDetailStrain({...detailStrain,intent});
  };
 
  const setCopAmount=(amount)=>{
    if(!detailStrain)return;
    const c=detailStrain.cops[detailCopIdx];
    if(!c||c.amount)return;
    const updated=strains.map(s=>s.id!==detailStrain.id?s:{...s,cops:s.cops.map(cc=>cc.id!==c.id?cc:{...cc,amount})});
    setStrains(updated);setDetailStrain({...detailStrain,cops:detailStrain.cops.map(cc=>cc.id!==c.id?cc:{...cc,amount})});
  };
 
  const setCoppedIntent=(id,intent)=>{
    setCoppedEntries(prev=>prev.map(e=>e.id!==id?e:e.intent?e:{...e,intent}));
  };
 
  const setCoppedAmount=(id,amount)=>{
    setCoppedEntries(prev=>prev.map(e=>e.id!==id?e:e.amount?e:{...e,amount}));
  };
 
  const handleSaveNote=()=>{
    if(!detailStrain||!updateNote.trim())return;
    const note={id:Date.now(),date:today(),text:updateNote.trim()};
    const targetStrainId=detailStrain.id;
    const targetCopIdx=detailCopIdx;
    setStrains(prev=>{
      const updated=prev.map(s=>{
        if(s.id!==targetStrainId)return s;
        const targetCop=s.cops[targetCopIdx];
        if(!targetCop)return s;
        return{...s,cops:s.cops.map(cc=>cc.id!==targetCop.id?cc:{...cc,notes:[...(cc.notes||[]),note]})};
      });
      const newDetail=updated.find(s=>s.id===targetStrainId);
      if(newDetail)setDetailStrain(newDetail);
      return updated;
    });
    setUpdateNote("");
    setMixMode(null);
  };
 
  const[confirmDelete,setConfirmDelete]=useState(null);
 
  const deleteFromCop=(field,itemId)=>{
    if(!detailStrain)return;
    if(confirmDelete!==field+"-"+itemId){setConfirmDelete(field+"-"+itemId);return;}
    const sid=detailStrain.id;const cidx=detailCopIdx;
    setStrains(prev=>{
      // For mixes, find sharedId and remove from ALL strains
      let sharedId=null;
      if(field==="mixes"){
        const tc=prev.find(s=>s.id===sid)?.cops[cidx];
        const mix=(tc?.mixes||[]).find(m=>m.id===itemId);
        sharedId=mix?.sharedId;
      }
      const updated=prev.map(s=>{
        if(field==="mixes"&&sharedId){
          // Remove from all cops on all strains by sharedId
          return{...s,cops:s.cops.map(cc=>({...cc,mixes:(cc.mixes||[]).filter(m=>m.sharedId!==sharedId)}))};
        }
        if(s.id!==sid)return s;
        const tc=s.cops[cidx];if(!tc)return s;
        return{...s,cops:s.cops.map(cc=>cc.id!==tc.id?cc:{...cc,[field]:(cc[field]||[]).filter(x=>x.id!==itemId)})};
      });
      setDetailStrain(updated.find(s=>s.id===sid));
      return updated;
    });
    setConfirmDelete(null);setEditingItem(null);
  };
 
  const editNoteText=(noteId,newText)=>{
    if(!detailStrain||!newText.trim())return;
    const sid=detailStrain.id;const cidx=detailCopIdx;
    setStrains(prev=>{
      const updated=prev.map(s=>{
        if(s.id!==sid)return s;
        const tc=s.cops[cidx];if(!tc)return s;
        return{...s,cops:s.cops.map(cc=>cc.id!==tc.id?cc:{...cc,notes:(cc.notes||[]).map(n=>n.id!==noteId?n:{...n,text:newText.trim()})})};
      });
      setDetailStrain(updated.find(s=>s.id===sid));
      return updated;
    });
    setEditingItem(null);setEditText("");
  };
 
  const editExpNote=(expId,newNote)=>{
    if(!detailStrain)return;
    const sid=detailStrain.id;const cidx=detailCopIdx;
    setStrains(prev=>{
      const updated=prev.map(s=>{
        if(s.id!==sid)return s;
        const tc=s.cops[cidx];if(!tc)return s;
        return{...s,cops:s.cops.map(cc=>cc.id!==tc.id?cc:{...cc,experiences:(cc.experiences||[]).map(e=>e.id!==expId?e:{...e,note:newNote.trim()})})};
      });
      setDetailStrain(updated.find(s=>s.id===sid));
      return updated;
    });
    setEditingItem(null);setEditText("");
  };
 
  const handleUpdateRating=(newRating)=>{
    if(!detailStrain)return;
    const sid=detailStrain.id;const cidx=detailCopIdx;
    setStrains(prev=>{
      const updated=prev.map(s=>{
        if(s.id!==sid)return s;
        const tc=s.cops[cidx];if(!tc)return s;
        return{...s,cops:s.cops.map(cc=>cc.id!==tc.id?cc:{...cc,session:{...cc.session,rating:newRating}})};
      });
      setDetailStrain(updated.find(s=>s.id===sid));
      return updated;
    });
    const copId=detailStrain.cops[detailCopIdx]?.id;
    if(copId!=null)setOnHand(prev=>prev.map(o=>o.copId!==copId?o:{...o,rating:newRating}));
  };
 
  const handleSaveExperience=()=>{
    if(!detailStrain)return;
    if(!expNote.note.trim()&&expNote.vibeTags.length===0&&!expMix.strain){setExpNote({...expNote,_error:true});return;}
    const expId=Date.now();
    const exp={id:expId,date:today(),setting:expNote.setting,bedtime:expNote.bedtime,note:expNote.note.trim(),vibeTags:[...expNote.vibeTags],
      mixedWith:expMix.strain?{name:expMix.strain.name,strainId:expMix.strain.id,type:getLatestCop(expMix.strain).type}:null};
    // Mirror experience for the OTHER strain if mixed
    const mirrorExp=expMix.strain?{...exp,id:expId+1,mixedWith:{name:detailStrain.name,strainId:detailStrain.id,type:detailStrain.cops[detailCopIdx]?.type}}:null;
    const targetStrainId=detailStrain.id;
    const targetCopIdx=detailCopIdx;
    const mixWithId=expMix.strain?.id;
    setStrains(prev=>{
      const updated=prev.map(s=>{
        if(s.id===targetStrainId){
          const targetCop=s.cops[targetCopIdx];
          if(!targetCop)return s;
          return{...s,cops:s.cops.map(cc=>cc.id!==targetCop.id?cc:{...cc,experiences:[...(cc.experiences||[]),exp]})};
        }
        if(mirrorExp&&s.id===mixWithId){
          const mwCop=s.cops.find(c=>c.status==="on-hand")||s.cops[s.cops.length-1];
          if(!mwCop)return s;
          return{...s,cops:s.cops.map(cc=>cc.id!==mwCop.id?cc:{...cc,experiences:[...(cc.experiences||[]),mirrorExp]})};
        }
        return s;
      });
      const newDetail=updated.find(s=>s.id===targetStrainId);
      if(newDetail)setDetailStrain(newDetail);
      return updated;
    });
    setExpNote({note:"",setting:"indoor",bedtime:false,vibeTags:[]});
    setExpMix({active:false,strain:null});
    setMixMode(null);
  };
 
  const handleSaveMix=(rateLater=false)=>{
    if(!detailStrain||!mixWith)return;
    const c=detailStrain.cops[detailCopIdx];
    const mwCop=getLatestCop(mixWith);
    const ct=[...new Set([...c.terpenes,...(mwCop?.terpenes||[])])];
    const cTaste=[...new Set([...(c.session?.tasteTags||[]),...(mwCop?.session?.tasteTags||[])])];
    const mixSharedId=Date.now();
    // Mix entry on the primary strain
    const me={id:mixSharedId,sharedId:mixSharedId,withStrain:mixWith.name,withStrainId:mixWith.id,primaryStrain:detailStrain.name,primaryStrainId:detailStrain.id,primaryType:c.type,withType:mwCop.type,status:rateLater?"queued":"reviewed",
      rating:mixSess.rating,spectrums:{sw:mixSess.sw,sf:mixSess.sf},pull:mixSess.pull,bedtime:mixSess.bedtime,
      vibeTags:[...mixSess.vibeTags],combinedTerpenes:ct,combinedTaste:cTaste,notes:mixSess.notes,date:today()};
    // Mirror entry on the OTHER strain (so OG Kush sees the mix too)
    const mirror={...me,id:mixSharedId+1,withStrain:detailStrain.name,withStrainId:detailStrain.id,primaryStrain:mixWith.name,primaryStrainId:mixWith.id,primaryType:mwCop.type,withType:c.type};
    if(rateLater){setMixQueue([{...me,copId:c.id},...mixQueue]);}
    const updated=strains.map(s=>{
      if(s.id===detailStrain.id)return{...s,cops:s.cops.map(cc=>cc.id!==c.id?cc:{...cc,mixes:[...(cc.mixes||[]),me]})};
      if(s.id===mixWith.id)return{...s,cops:s.cops.map(cc=>cc.id!==mwCop.id?cc:{...cc,mixes:[...(cc.mixes||[]),mirror]})};
      return s;
    });
    setStrains(updated);setDetailStrain(updated.find(s=>s.id===detailStrain.id));reset("mix");
  };
 
  const handleReviewMix=qItem=>{
    setMixSess({rating:0,sw:0,sf:0,pull:0,vibeTags:[],notes:""});
    setEditEntry(qItem);setView("reviewMix");
  };
 
  const handleSaveMixReview=()=>{
    if(!editEntry)return;
    const sharedId=editEntry.sharedId||editEntry.id;
    const reviewUpdate={status:"reviewed",rating:mixSess.rating,spectrums:{sw:mixSess.sw,sf:mixSess.sf},pull:mixSess.pull,bedtime:mixSess.bedtime,vibeTags:[...mixSess.vibeTags],notes:mixSess.notes};
    const updated=strains.map(s=>({...s,cops:s.cops.map(c=>({...c,mixes:(c.mixes||[]).map(m=>m.sharedId===sharedId?{...m,...reviewUpdate}:m)}))}));
    setStrains(updated);setMixQueue(mixQueue.filter(q=>q.id!==editEntry.id));
    setMixSess({rating:0,sw:0,sf:0,pull:0,vibeTags:[],notes:""});setEditEntry(null);setView(null);
  };
 
  const mismatch=editEntry&&session.smokesLike&&editEntry.type&&(()=>{
    const label=editEntry.lean?`${editEntry.lean.toLowerCase()} ${editEntry.type.toLowerCase()}`:editEntry.type.toLowerCase();
    if(editEntry.type==="Hybrid"&&session.smokesLike!=="Hybrid")return`labeled ${label} but smokes like ${session.smokesLike.toLowerCase()}`;
    if(editEntry.type!=="Hybrid"&&session.smokesLike!==editEntry.type)return`labeled ${label} but smokes like ${session.smokesLike.toLowerCase()}`;
    return null;
  })();
 
  // ═══ COP FORM ═══
  if(view==="reupPicker")return(<Wrapper><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><BackBtn onClick={()=>{setSelectingReup(false);setActiveReupId(null);setView(null);}}/><div><h2 style={{fontSize:20,fontWeight:500,margin:0,color:P.text}}>which re-up?</h2><p style={{fontSize:12,color:P.textMuted,margin:"2px 0 0"}}>add this cop to a haul</p></div></div>
    <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
      {reups.filter(r=>!r.closed).length>0&&<><p style={{fontSize:12,color:P.textMuted,margin:"0 0 10px"}}>open re-ups</p>
        {reups.filter(r=>!r.closed).map(r=>{
          const cops=strains.flatMap(s=>s.cops.filter(c=>r.copIds.includes(c.id)).map(c=>({...c,strain:s})));
          const copped=coppedEntries.filter(c=>r.coppedIds?.includes(c.id));
          const total=cops.length+copped.length;
          return(<button key={r.id} onClick={()=>{setActiveReupId(r.id);setView("cop");}} style={{display:"block",width:"100%",textAlign:"left",background:P.bg,borderRadius:10,padding:14,marginBottom:8,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:14,fontWeight:500,color:P.text}}>re-up · {r.date}</span>
              <span style={{fontSize:11,color:P.textMuted}}>{total} strain{total!==1?"s":""}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {cops.map(c=><span key={c.id} style={{fontSize:10,background:P.surface,color:P.textWarm,padding:"2px 6px",borderRadius:6}}>{c.strain.name}</span>)}
              {copped.map(c=><span key={c.id} style={{fontSize:10,background:P.terracottaLight,color:P.terracotta,padding:"2px 6px",borderRadius:6}}>{c.strainName}</span>)}
            </div>
          </button>);
        })}
      </>}
      {reups.filter(r=>!r.closed).length<2&&<button onClick={()=>{
        const newId="r"+Date.now();
        const newReup={id:newId,date:today(),closed:false,copIds:[],coppedIds:[]};
        setReups([...reups,newReup]);setActiveReupId(newId);setView("cop");
      }} style={{width:"100%",padding:12,borderRadius:10,fontSize:13,fontWeight:500,background:P.terracotta,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit",marginTop:reups.filter(r=>!r.closed).length>0?8:0}}>+ start a new re-up</button>}
      {reups.filter(r=>!r.closed).length>=2&&<p style={{fontSize:11,color:P.textMuted,margin:"8px 0 0",fontStyle:"italic",textAlign:"center"}}>you can have up to 2 open re-ups at a time</p>}
    </div></Wrapper>);
 
  if(view==="cop")return(<Wrapper><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><BackBtn onClick={()=>{reset("cop");setView(null);}}/><div><h2 style={{fontSize:20,fontWeight:500,margin:0,color:P.text}}>new cop</h2><p style={{fontSize:12,color:P.textMuted,margin:"2px 0 0"}}>log what you just picked up</p></div></div>
    <div style={{background:P.card,borderRadius:12,padding:20,border:`0.5px solid ${P.border}`}}>
      <label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>strain name</label>
      <div style={{position:"relative"}}><input value={cop.name} onChange={e=>{setCop({...cop,name:e.target.value,existingStrainId:null});setShowSugg(true);}} placeholder="enter strain name..." style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:15,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none",marginBottom:cop.existingStrainId?4:20}}/>
        {showSugg&&(nameSuggs.length>0||legacySuggs.length>0)&&!cop.existingStrainId&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:10,background:P.card,border:`0.5px solid ${P.border}`,borderRadius:8,marginTop:2,maxHeight:160,overflowY:"auto"}}>
          {nameSuggs.map(s=><button key={s.id} onClick={()=>handleSelectExisting(s)} style={{display:"flex",width:"100%",padding:"10px 14px",fontSize:13,color:P.text,background:"transparent",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit",alignItems:"center",gap:8}} onMouseOver={e=>e.currentTarget.style.background=P.bg} onMouseOut={e=>e.currentTarget.style.background="transparent"}><div style={{width:4,height:24,borderRadius:2,background:typeColor(getLatestCop(s).type)}}/><span style={{fontWeight:500}}>{s.name}</span><span style={{fontSize:11,color:P.textMuted}}>{s.cops.length} cop{s.cops.length>1?"s":""}</span></button>)}
          {legacySuggs.map(l=><button key={l.id} onClick={()=>{setCop({...cop,name:l.name,type:l.type||cop.type});setShowSugg(false);}} style={{display:"flex",width:"100%",padding:"10px 14px",fontSize:13,color:P.text,background:"transparent",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit",alignItems:"center",gap:8}} onMouseOver={e=>e.currentTarget.style.background=P.bg} onMouseOut={e=>e.currentTarget.style.background="transparent"}><div style={{width:4,height:24,borderRadius:2,background:l.type?typeColor(l.type):P.borderDark}}/><span style={{fontWeight:500}}>{l.name}</span><span style={{fontSize:11,color:P.textMuted}}>legacy</span>{l.copAgain==="Never again"&&<span style={{fontSize:9,background:P.red,color:P.cream,padding:"1px 4px",borderRadius:4}}>🔒</span>}</button>)}
        </div>}
      </div>
      {cop.existingStrainId&&<p style={{fontSize:11,color:P.sage,margin:"0 0 16px"}}>✓ new cop of existing strain</p>}
      <label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>type</label>
      <ToggleGroup options={["Sativa","Indica","Hybrid"]} value={cop.type} onChange={v=>setCop({...cop,type:v,lean:""})}/>
      {cop.type==="Hybrid"&&<SubToggle options={["Sativa-lean","Indica-lean","Balanced"]} value={cop.lean} onChange={v=>setCop({...cop,lean:v})}/>}<div style={{marginBottom:20}}/>
      <label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>source</label>
      <ToggleGroup options={["TL","Dispensary"]} value={cop.source} onChange={v=>setCop({...cop,source:v,container:"",brand:""})}/>
      {cop.source==="Dispensary"&&<><SubToggle options={["Bag","Jar"]} value={cop.container} onChange={v=>setCop({...cop,container:v})} color={P.terracotta} label="packaging:"/>
        <SubToggle options={["Indoor grown","Greenhouse grown","Outdoor grown"]} value={cop.growType} onChange={v=>setCop({...cop,growType:v})} color={P.sage} label="grow type:"/>
        <div style={{marginTop:10}}><label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>brand <span style={{fontWeight:400,fontStyle:"italic"}}>(optional)</span></label>
        <input value={cop.brand} onChange={e=>setCop({...cop,brand:e.target.value})} placeholder="e.g. cookies, jungle boys..." style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none"}}/></div>
      </>}<div style={{marginBottom:20}}/>
      <label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>terpenes</label>
      <TerpeneSelector selected={cop.terpenes} onChange={t=>setCop({...cop,terpenes:t})}/><div style={{marginBottom:20}}/>
      {!cop.existingStrainId&&<><label style={{fontSize:12,fontWeight:500,color:P.textMuted,display:"block",marginBottom:6}}>parent strains <span style={{fontWeight:400,fontStyle:"italic"}}>(optional)</span></label><div style={{display:"flex",gap:8,marginBottom:20}}><input value={cop.parent1} onChange={e=>setCop({...cop,parent1:e.target.value})} placeholder="parent 1" style={{flex:1,background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none"}}/><span style={{display:"flex",alignItems:"center",color:P.textMuted}}>x</span><input value={cop.parent2} onChange={e=>setCop({...cop,parent2:e.target.value})} placeholder="parent 2" style={{flex:1,background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none"}}/></div></>}
      <button onClick={handleSaveCop} style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:500,background:P.terracotta,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save cop</button>
    </div></Wrapper>);
 
  // ═══ SESSION FORM ═══
  if(view==="session"&&editEntry)return(<Wrapper><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><BackBtn onClick={()=>{reset("session");setEditEntry(null);setView(null);}}/><div><h2 style={{fontSize:20,fontWeight:500,margin:0,color:P.text}}>{editEntry.strainName}</h2><p style={{fontSize:12,color:P.textMuted,margin:"2px 0 0"}}>{[editEntry.type?.toLowerCase(),editEntry.lean?.toLowerCase(),editEntry.source==="TL"?"TL":editEntry.source?.toLowerCase(),editEntry.date].filter(Boolean).join(" · ")}</p></div></div>
    {editEntry.terpenes?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:20}}>{editEntry.terpenes.map(t=><span key={t} style={{fontSize:11,background:P.sage,color:P.cream,padding:"3px 10px",borderRadius:10}}>{t.toLowerCase()}</span>)}</div>}
    <div style={{background:P.card,borderRadius:12,padding:20,border:`0.5px solid ${P.border}`}}>
      <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 20px"}}>first session — how'd it hit on its own?</p>
      <div style={{textAlign:"center",marginBottom:20,paddingBottom:16,borderBottom:`0.5px solid ${P.border}`}}><p style={{fontSize:12,color:P.textMuted,margin:"0 0 8px"}}>overall vibe</p><div style={{display:"flex",justifyContent:"center",gap:6}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setSession({...session,rating:n})} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Leaf filled={n<=session.rating}/></button>)}</div>{session.rating>0&&<p style={{fontSize:11,color:P.sage,margin:"6px 0 0",fontWeight:500}}>{session.rating} / 5</p>}</div>
      <SectionLabel>setting</SectionLabel>
      <ToggleGroup options={["indoor","outdoor"]} value={session.setting} onChange={v=>setSession({...session,setting:v,bedtime:v==="outdoor"?false:session.bedtime})} color={P.onHand}/>
      {session.setting==="indoor"&&<button onClick={()=>setSession({...session,bedtime:!session.bedtime})} style={{display:"flex",alignItems:"center",gap:6,marginTop:8,padding:"6px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",background:session.bedtime?"#2C2C4A":"transparent",color:session.bedtime?"#C9B8F0":P.textMuted,border:session.bedtime?"none":`0.5px solid ${P.border}`}}>🌙 bedtime blunt{session.bedtime&&" ✓"}</button>}
      <div style={{marginBottom:20}}/>
      <SectionLabel>smokes like</SectionLabel>
      <ToggleGroup options={["Sativa","Indica","Hybrid"]} value={session.smokesLike} onChange={v=>setSession({...session,smokesLike:v,smokesLikeLean:""})} color={P.terracotta}/>
      {session.smokesLike==="Hybrid"&&<SubToggle options={["Sativa-lean","Indica-lean","Balanced"]} value={session.smokesLikeLean} onChange={v=>setSession({...session,smokesLikeLean:v})} color={P.terracotta}/>}
      {mismatch&&<div style={{background:P.terracottaLight,borderRadius:8,padding:"8px 12px",marginTop:8,display:"flex",alignItems:"center",gap:6}}><span>👀</span><p style={{fontSize:11,color:"#9A6530",margin:0}}>{mismatch}</p></div>}<div style={{marginBottom:20}}/>
      <SectionLabel>the spectrums</SectionLabel>
      <SpectrumSlider left="Couch-locked" right="Active" value={session.sw} onChange={v=>setSession({...session,sw:v})}/>
      <SpectrumSlider left="Dreamy" right="Analytical" value={session.sf} onChange={v=>setSession({...session,sf:v})} color={P.sage}/>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:16,marginBottom:16}}><SectionLabel>the smoke</SectionLabel><SpectrumSlider left="Smooth" right="Harsh" value={session.pull} onChange={v=>setSession({...session,pull:v})} color={P.sage}/></div>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:16,marginBottom:16}}><p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 10px"}}>vibe + taste tags</p><TagSelector categories={VIBE_CATEGORIES} tags={VIBE_TAGS} selected={[...session.vibeTags,...session.tasteTags]} onChange={v=>{const tasteSet=new Set(VIBE_CATEGORIES["👅"]);setSession({...session,vibeTags:v.filter(t=>!tasteSet.has(t)),tasteTags:v.filter(t=>tasteSet.has(t))});}} /></div>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:16,marginBottom:16}}><p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 8px"}}>session notes <span style={{fontWeight:400,color:P.textMuted,fontStyle:"italic"}}>(optional)</span></p><textarea value={session.notes} onChange={e=>setSession({...session,notes:e.target.value})} placeholder="anything else worth noting..." rows={2} style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none",resize:"vertical"}}/></div>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:16,marginBottom:20}}><p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 10px"}}>would i cop again?</p><div style={{display:"flex",gap:6}}>{["Yes","Maybe","No","Never again"].map(o=><button key={o} onClick={()=>setSession({...session,copAgain:o})} style={{flex:1,padding:"10px 4px",borderRadius:8,fontSize:o==="Never again"?10:13,fontFamily:"inherit",cursor:"pointer",fontWeight:session.copAgain===o?500:400,background:session.copAgain===o?copAgainColor(o):P.bg,color:session.copAgain===o?P.cream:P.textMuted,border:session.copAgain===o?"none":`0.5px solid ${P.border}`,transition:"all 0.15s"}}>{o.toLowerCase()}</button>)}</div></div>
      <button onClick={handleSaveSession} style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:500,background:P.terracotta,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save first session</button>
    </div></Wrapper>);
 
  // ═══ MIX REVIEW ═══
  if(view==="reviewMix"&&editEntry)return(<Wrapper>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>{setEditEntry(null);setView(null);}}/><div><h2 style={{fontSize:20,fontWeight:500,margin:0,color:P.text}}>review mix</h2></div></div>
    <div style={{background:P.plumLight,borderRadius:10,padding:14,marginBottom:16,border:`0.5px solid ${P.plumBorder}`}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:16,borderRadius:2,background:typeColor(editEntry.primaryType)}}/><span style={{fontSize:14,fontWeight:500,color:"#5C4A5C"}}>{editEntry.primaryStrain}</span><span style={{fontSize:10,color:P.textMuted}}>{editEntry.primaryType?.toLowerCase()}</span></div>
        <span style={{fontSize:12,color:P.textMuted}}>x</span>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:16,borderRadius:2,background:typeColor(editEntry.withType)}}/><span style={{fontSize:14,fontWeight:500,color:"#5C4A5C"}}>{editEntry.withStrain}</span><span style={{fontSize:10,color:P.textMuted}}>{editEntry.withType?.toLowerCase()}</span></div>
      </div>
      {editEntry.combinedTerpenes&&<div style={{display:"flex",flexWrap:"wrap",gap:3}}>{editEntry.combinedTerpenes.map(t=><span key={t} style={{fontSize:10,background:P.plum,color:P.cream,padding:"2px 8px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>}
      {editEntry.combinedTaste?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:6}}>{editEntry.combinedTaste.map(t=><span key={t} style={{fontSize:10,background:P.terracotta,color:P.cream,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>}
    </div>
    <div style={{background:P.card,borderRadius:12,padding:20,border:`0.5px solid ${P.plumBorder}`}}>
      <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 16px"}}>how'd the mix hit?</p>
      <div style={{textAlign:"center",marginBottom:16,paddingBottom:12,borderBottom:`0.5px solid ${P.border}`}}><div style={{display:"flex",justifyContent:"center",gap:6}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setMixSess({...mixSess,rating:n})} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Leaf filled={n<=mixSess.rating} color={P.plum}/></button>)}</div></div>
      <button onClick={()=>setMixSess({...mixSess,bedtime:!mixSess.bedtime})} style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,padding:"6px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",background:mixSess.bedtime?"#2C2C4A":"transparent",color:mixSess.bedtime?"#C9B8F0":P.textMuted,border:mixSess.bedtime?"none":`0.5px solid ${P.border}`}}>🌙 bedtime blunt{mixSess.bedtime&&" ✓"}</button>
      <SpectrumSlider left="Couch-locked" right="Active" value={mixSess.sw} onChange={v=>setMixSess({...mixSess,sw:v})} color={P.plum}/>
      <SpectrumSlider left="Dreamy" right="Analytical" value={mixSess.sf} onChange={v=>setMixSess({...mixSess,sf:v})} color={P.plum}/>
      <SpectrumSlider left="Smooth" right="Harsh" value={mixSess.pull} onChange={v=>setMixSess({...mixSess,pull:v})} color={P.plum}/>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:14,marginBottom:14}}><p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 10px"}}>vibe tags</p><TagSelector categories={VIBE_CATEGORIES} tags={VIBE_TAGS} selected={mixSess.vibeTags} onChange={v=>setMixSess({...mixSess,vibeTags:v})} color={P.plum}/></div>
      <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:14,marginBottom:16}}><textarea value={mixSess.notes} onChange={e=>setMixSess({...mixSess,notes:e.target.value})} placeholder="how'd the combo play together..." rows={2} style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none",resize:"vertical"}}/></div>
      <button onClick={handleSaveMixReview} style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:500,background:P.plum,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save mix review</button>
    </div></Wrapper>);
 
  // ═══ STRAIN DETAIL ═══
  if(view==="detail"&&detailStrain){const locked=isNeverAgain(detailStrain);const activeCop=detailStrain.cops[detailCopIdx];const s=activeCop?.session;
    return(<Wrapper>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><BackBtn onClick={()=>{setView(null);setDetailStrain(null);reset("mix");}}/><div style={{flex:1}}><h2 style={{fontSize:22,fontWeight:500,margin:0,color:P.text,fontFamily:"'Playfair Display',serif"}}>{detailStrain.name}</h2>
        {!editingParents&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
          {detailStrain.unknownLineage
            ?<p style={{fontSize:11,color:P.textMuted,margin:0,fontStyle:"italic"}}>lineage unknown</p>
            :detailStrain.parents?.length>0
              ?<p style={{fontSize:12,color:P.textMuted,margin:0}}>{detailStrain.parents.join(" x ")}</p>
              :<p style={{fontSize:11,color:P.borderDark,margin:0,fontStyle:"italic"}}>no parents logged</p>}
          {!locked&&!detailStrain.unknownLineage&&<button onClick={()=>setEditingParents({p1:detailStrain.parents?.[0]||"",p2:detailStrain.parents?.[1]||""})} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2l6.5-6.5z" stroke={P.textMuted} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
          {!detailStrain.parents?.length&&<button onClick={toggleUnknownLineage} style={{background:"none",border:"none",cursor:"pointer",padding:"1px 4px",fontSize:10,color:detailStrain.unknownLineage?P.sage:P.textMuted,fontFamily:"inherit",textDecoration:"underline",textDecorationStyle:"dotted"}}>{detailStrain.unknownLineage?"undo":"unknown lineage?"}</button>}
        </div>}
        {editingParents&&<div style={{display:"flex",gap:6,alignItems:"center",marginTop:6}}>
          <input value={editingParents.p1} onChange={e=>setEditingParents({...editingParents,p1:e.target.value})} placeholder="parent 1" style={{flex:1,background:P.bg,borderRadius:6,padding:"6px 10px",fontSize:12,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none"}}/>
          <span style={{fontSize:11,color:P.textMuted}}>x</span>
          <input value={editingParents.p2} onChange={e=>setEditingParents({...editingParents,p2:e.target.value})} placeholder="parent 2" style={{flex:1,background:P.bg,borderRadius:6,padding:"6px 10px",fontSize:12,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={()=>handleSaveParents(editingParents.p1,editingParents.p2)} style={{background:P.sage,color:P.cream,border:"none",borderRadius:6,padding:"6px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>save</button>
          <button onClick={()=>setEditingParents(null)} style={{background:"none",border:"none",cursor:"pointer",padding:2,fontSize:11,color:P.textMuted}}>✕</button>
        </div>}
      </div>{!locked&&<button onClick={toggleStar} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill={detailStrain.starred?"#C9A84C":"none"} stroke={detailStrain.starred?"#C9A84C":P.borderDark} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round"/></svg>
      </button>}{locked&&<span style={{fontSize:16}}>🔒</span>}</div>
 
      {/* Intent + Amount */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {detailStrain.intent
          ?<span style={{fontSize:11,padding:"3px 10px",borderRadius:8,background:detailStrain.intent==="asleep"?"#1A1A2E":detailStrain.intent==="awake"?"#FFF3E8":"#EDF2E8",color:detailStrain.intent==="asleep"?"#C9B8F0":detailStrain.intent==="awake"?"#C17F4A":"#6B7F5A",border:detailStrain.intent==="awake"?`0.5px solid #E8D0B0`:"none"}}>{detailStrain.intent==="asleep"?"🌙 asleep":detailStrain.intent==="awake"?"☀️ awake":"🏕️ adventure"}</span>
          :<div style={{display:"flex",gap:4}}>{["asleep","awake","adventure"].map(i=><button key={i} onClick={()=>setStrainIntent(i)} style={{fontSize:10,padding:"3px 9px",borderRadius:8,border:`0.5px solid ${P.border}`,background:P.bg,color:P.textMuted,cursor:"pointer",fontFamily:"inherit"}}>{i==="asleep"?"🌙":i==="awake"?"☀️":"🏕️"} {i}</button>)}</div>}
        {activeCop?.amount
          ?<span style={{fontSize:11,padding:"3px 10px",borderRadius:8,background:P.surface,color:P.textMuted,border:`0.5px solid ${P.border}`}}>⚖️ {activeCop.amount}</span>
          :<div style={{display:"flex",gap:4}}>{["8th","quarter","half","oz"].map(a=><button key={a} onClick={()=>setCopAmount(a)} style={{fontSize:10,padding:"3px 9px",borderRadius:8,border:`0.5px solid ${P.border}`,background:P.bg,color:P.textMuted,cursor:"pointer",fontFamily:"inherit"}}>{a}</button>)}</div>}
      </div>
 
      {/* Cop tabs if multiple */}
      {detailStrain.cops.length>1&&<div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto"}}>{detailStrain.cops.map((c,i)=>(<button key={c.id} onClick={()=>setDetailCopIdx(i)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",fontWeight:detailCopIdx===i?500:400,background:detailCopIdx===i?typeColor(c.type):"transparent",color:detailCopIdx===i?P.cream:P.textMuted,border:detailCopIdx===i?"none":`1px solid ${P.borderDark}`}}>cop #{i+1} · {c.date}</button>))}</div>}
 
      {activeCop&&s&&<>
        {/* Cop info */}
        <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,borderLeft:`4px solid ${typeColor(activeCop.type)}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div><p style={{fontSize:13,fontWeight:500,color:P.text,margin:0}}>{[activeCop.type,activeCop.lean].filter(Boolean).join(" · ").toLowerCase()} · {activeCop.date}</p></div>
            <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=>activeCop.status!=="done"?(<button key={n} onClick={()=>handleUpdateRating(n)} style={{background:"none",border:"none",cursor:"pointer",padding:1}}><Leaf filled={n<=s.rating} size={18} color={s.copAgain==="Never again"?P.red:P.sage}/></button>):(<Leaf key={n} filled={n<=s.rating} size={18} color={s.copAgain==="Never again"?P.red:P.sage}/>))}</div><span style={{fontSize:10,background:copAgainColor(s.copAgain),color:P.cream,padding:"2px 6px",borderRadius:8}}>{"🔄 "+s.copAgain.toLowerCase()}</span></div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>{activeCop.terpenes.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
          <button onClick={()=>{setShowMore(!showMore);if(showMore)setShowMore2(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:11,color:P.sage,fontFamily:"inherit"}}>{showMore?"hide ▲":"show more ▼"}</button>
 
          {/* LEVEL 1: source, setting, first impression, notes */}
          {showMore&&<div style={{marginTop:10,paddingTop:10,borderTop:`0.5px solid ${P.border}`}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
              {activeCop.source&&<span style={{fontSize:10,background:P.bg,color:P.textMuted,padding:"2px 6px",borderRadius:6,border:`0.5px solid ${P.border}`}}>🏪 {[fmtSource(activeCop.source),activeCop.container?.toLowerCase()].filter(Boolean).join(" · ")}</span>}
              {activeCop.brand&&<span style={{fontSize:10,background:P.bg,color:P.textMuted,padding:"2px 6px",borderRadius:6,border:`0.5px solid ${P.border}`}}>🏷️ {activeCop.brand}</span>}
              {activeCop.growType&&<span style={{fontSize:10,background:P.bg,color:P.textMuted,padding:"2px 6px",borderRadius:6,border:`0.5px solid ${P.border}`}}>🌱 {activeCop.growType.toLowerCase()}</span>}
              <span style={{fontSize:10,background:s.setting==="outdoor"?P.onHand:s.bedtime?"#2C2C4A":P.surface,color:s.setting==="outdoor"?P.cream:s.bedtime?"#C9B8F0":P.textMuted,padding:"2px 6px",borderRadius:6}}>{s.setting==="outdoor"?"🌿 outdoor":s.bedtime?"🌙 bedtime":"🏠 indoor"}</span>
              {s.smokesLike&&s.smokesLike!==activeCop.type&&<span style={{fontSize:10,background:P.terracottaLight,color:P.terracotta,padding:"2px 6px",borderRadius:6}}>👀 smokes {s.smokesLike.toLowerCase()}</span>}
            </div>
            {activeCop.firstNotes&&<p style={{fontSize:12,color:P.textMuted,margin:"0 0 8px",lineHeight:1.4}}>first impression: {activeCop.firstNotes}</p>}
            <button onClick={()=>setShowMore2(!showMore2)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:11,color:P.sage,fontFamily:"inherit"}}>{showMore2?"hide spectrums + tags ▲":"show spectrums + tags ▼"}</button>
 
            {/* LEVEL 2: spectrums, pull, taste, vibes, session notes */}
            {showMore2&&<div style={{marginTop:10,paddingTop:10,borderTop:`0.5px solid ${P.border}`}}>
              <SpectrumDisplay left="Couch-locked" right="Active" val={s.spectrums?.sw} color={P.plum}/>
              <SpectrumDisplay left="Dreamy" right="Analytical" val={s.spectrums?.sf} color={P.sage}/>
              <SpectrumDisplay left="Smooth" right="Harsh" val={s.pull} color={P.sage}/>
              {(s.tasteTags?.length>0||s.vibeTags?.length>0)&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:6}}>
                {s.tasteTags?.map(t=><span key={t} style={{fontSize:10,background:P.terracotta,color:P.cream,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}
                {s.vibeTags?.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.textWarm,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}
              </div>}
              {s.notes&&<div style={{background:"#F9F6F0",borderRadius:0,padding:"8px 10px",marginTop:10,borderLeft:`3px solid ${P.terracotta}`}}><p style={{fontSize:12,color:P.textWarm,margin:0,lineHeight:1.5,whiteSpace:"pre-line"}}>{s.notes}</p></div>}
            </div>}
          </div>}
        </div>
 
        {/* Notes */}
        {activeCop.notes?.length>0&&<div style={{marginBottom:10}}><SectionLabel>notes</SectionLabel>{activeCop.notes.map(n=>(<div key={n.id} style={{background:"#FBF4DC",borderRadius:10,padding:12,marginBottom:6,border:`0.5px solid #E8D89C`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:11,fontWeight:500,color:"#7A6614"}}>📝 {n.date}</span>
            {activeCop.status==="on-hand"&&editingItem!=="note-"+n.id&&<div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setEditingItem("note-"+n.id);setEditText(n.text);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#7A6614",fontFamily:"inherit"}}>edit</button>
              <button onClick={()=>deleteFromCop("notes",n.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.red,fontFamily:"inherit"}}>{confirmDelete==="notes-"+n.id?"confirm?":"delete"}</button>
            </div>}
          </div>
          {editingItem==="note-"+n.id?<div><textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={2} style={{width:"100%",boxSizing:"border-box",background:P.cream,borderRadius:6,padding:"8px 10px",fontSize:12,color:P.text,border:`0.5px solid #E8D89C`,fontFamily:"inherit",outline:"none",resize:"vertical",marginBottom:6}}/>
            <div style={{display:"flex",gap:6}}><button onClick={()=>{setEditingItem(null);setEditText("");}} style={{fontSize:10,color:P.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>cancel</button><button onClick={()=>editNoteText(n.id,editText)} style={{fontSize:10,color:"#7A6614",fontWeight:500,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>save</button></div>
          </div>:<p style={{fontSize:12,color:"#5C4D14",margin:0,lineHeight:1.4}}>{n.text}</p>}
        </div>))}</div>}
 
        {/* Experiences */}
        {activeCop.experiences?.length>0&&<div style={{marginBottom:10}}><SectionLabel>experiences</SectionLabel>{activeCop.experiences.map(exp=>(<div key={exp.id} style={{background:P.card,borderRadius:10,padding:12,marginBottom:6,border:`0.5px solid ${P.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,fontWeight:500,color:P.text}}>{exp.date}</span><span style={{fontSize:10,background:exp.setting==="outdoor"?P.onHand:exp.bedtime?"#2C2C4A":P.surface,color:exp.setting==="outdoor"?P.cream:exp.bedtime?"#C9B8F0":P.textMuted,padding:"1px 6px",borderRadius:6}}>{exp.setting==="outdoor"?"🌿 outdoor":exp.bedtime?"🌙 bedtime":"🏠 indoor"}</span></div>
            {activeCop.status==="on-hand"&&editingItem!=="exp-"+exp.id&&<div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setEditingItem("exp-"+exp.id);setEditText(exp.note);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.sage,fontFamily:"inherit"}}>edit</button>
              <button onClick={()=>deleteFromCop("experiences",exp.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.red,fontFamily:"inherit"}}>{confirmDelete==="experiences-"+exp.id?"confirm?":"delete"}</button>
            </div>}
          </div>
          {editingItem==="exp-"+exp.id?<div><textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={2} style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:6,padding:"8px 10px",fontSize:12,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none",resize:"vertical",marginBottom:6}}/>
            <div style={{display:"flex",gap:6}}><button onClick={()=>{setEditingItem(null);setEditText("");}} style={{fontSize:10,color:P.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>cancel</button><button onClick={()=>editExpNote(exp.id,editText)} style={{fontSize:10,color:P.sage,fontWeight:500,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>save</button></div>
          </div>:<>
            {exp.note&&<p style={{fontSize:12,color:P.text,margin:"0 0 4px",lineHeight:1.4}}>{exp.note}</p>}
            {exp.vibeTags?.length>0&&<div style={{display:"flex",gap:3,marginBottom:exp.mixedWith?6:0}}>{exp.vibeTags.map(t=><span key={t} style={{fontSize:9,background:P.surface,color:P.textWarm,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
            {exp.mixedWith&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
              <span style={{fontSize:10,color:P.plum}}>mixed with</span>
              <div style={{width:3,height:12,borderRadius:1,background:typeColor(exp.mixedWith.type)}}/>
              <span style={{fontSize:11,fontWeight:500,color:"#5C4A5C"}}>{exp.mixedWith.name}</span>
            </div>}
          </>}
        </div>))}</div>}
 
        {/* Mixes — compact summary */}
        {activeCop.mixes?.length>0&&<div style={{marginBottom:10}}><SectionLabel>mixes</SectionLabel>{activeCop.mixes.map(m=>(<div key={m.id} style={{background:P.plumLight,borderRadius:10,padding:12,marginBottom:6,border:`0.5px solid ${P.plumBorder}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:3,height:14,borderRadius:1,background:typeColor(m.primaryType||activeCop.type)}}/>
              <span style={{fontSize:12,fontWeight:500,color:"#5C4A5C"}}>{detailStrain.name}</span>
              <span style={{fontSize:11,color:P.textMuted}}>x</span>
              <div style={{width:3,height:14,borderRadius:1,background:typeColor(m.withType)}}/>
              <span style={{fontSize:12,fontWeight:500,color:"#5C4A5C"}}>{m.withStrain}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {m.status==="reviewed"?<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=m.rating} size={14} color={P.plum}/>)}</div></div>
              :<span style={{fontSize:10,background:P.plum,color:P.cream,padding:"2px 6px",borderRadius:8}}>needs review</span>}
              {activeCop.status==="on-hand"&&m.status!=="queued"&&<button onClick={()=>deleteFromCop("mixes",m.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:P.red,fontFamily:"inherit"}}>{confirmDelete==="mixes-"+m.id?"confirm?":"delete"}</button>}
            </div>
          </div>
          {m.combinedTerpenes&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:4}}>{m.combinedTerpenes.map(t=><span key={t} style={{fontSize:9,background:P.plum,color:P.cream,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
          {m.status==="reviewed"&&m.vibeTags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:4}}>{m.vibeTags.slice(0,3).map(t=><span key={t} style={{fontSize:9,background:P.surface,color:P.textWarm,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
          {m.notes&&m.status==="reviewed"&&<p style={{fontSize:11,color:"#5C4A5C",margin:"4px 0 0",lineHeight:1.4}}>{m.notes}</p>}
          <p style={{fontSize:10,color:P.textMuted,margin:"3px 0 0"}}>{m.date}</p>
        </div>))}</div>}
 
        {/* Actions */}
        {!locked&&!mixMode&&<div style={{display:"flex",gap:6,marginTop:10,marginBottom:16}}>
          {activeCop?.status==="on-hand"&&<button onClick={()=>setMixMode("note")} style={{flex:1,padding:10,borderRadius:8,fontSize:12,background:P.card,color:P.text,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>add note</button>}
          {activeCop?.status==="on-hand"&&<button onClick={()=>setMixMode("experience")} style={{flex:1,padding:10,borderRadius:8,fontSize:12,background:P.onHand,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>log experience</button>}
          {activeCop?.status==="on-hand"&&<button onClick={()=>setMixMode("mix")} style={{flex:1,padding:10,borderRadius:8,fontSize:12,background:P.plum,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>log mix</button>}
        </div>}
 
        {/* Note form */}
        {mixMode==="note"&&<div style={{background:"#FBF4DC",borderRadius:12,padding:16,border:`0.5px solid #E8D89C`,marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:500,color:"#7A6614",margin:"0 0 10px"}}>📝 add a note — {today()}</p>
          <textarea value={updateNote} onChange={e=>setUpdateNote(e.target.value)} placeholder="what's on your mind..." rows={3} style={{width:"100%",boxSizing:"border-box",background:P.cream,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid #E8D89C`,fontFamily:"inherit",outline:"none",resize:"vertical",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}><button onClick={()=>reset("mix")} style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:P.cream,color:P.textMuted,border:`0.5px solid #E8D89C`,cursor:"pointer",fontFamily:"inherit"}}>cancel</button><button onClick={handleSaveNote} style={{flex:1,padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:"#C9A84C",color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save note</button></div>
        </div>}
 
        {/* Experience form */}
        {mixMode==="experience"&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.onHand}`,marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 12px"}}>log an experience — {today()}</p>
          <div style={{marginBottom:12}}><p style={{fontSize:12,color:P.textMuted,margin:"0 0 6px"}}>setting</p><ToggleGroup options={["indoor","outdoor"]} value={expNote.setting} onChange={v=>setExpNote({...expNote,setting:v,bedtime:v==="outdoor"?false:expNote.bedtime,_error:false})} color={P.onHand}/>
          {expNote.setting==="indoor"&&<button onClick={()=>setExpNote({...expNote,bedtime:!expNote.bedtime})} style={{display:"flex",alignItems:"center",gap:6,marginTop:8,padding:"6px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",background:expNote.bedtime?"#2C2C4A":"transparent",color:expNote.bedtime?"#C9B8F0":P.textMuted,border:expNote.bedtime?"none":`0.5px solid ${P.border}`}}>🌙 bedtime blunt{expNote.bedtime&&" ✓"}</button>}
          </div>
          <textarea value={expNote.note} onChange={e=>setExpNote({...expNote,note:e.target.value,_error:false})} placeholder="what was different this time..." rows={3} style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${expNote._error?P.red:P.border}`,fontFamily:"inherit",outline:"none",resize:"vertical",marginBottom:expNote._error?4:12}}/>
          {expNote._error&&<p style={{fontSize:11,color:P.red,margin:"0 0 10px"}}>add a note, vibe tags, or a mix</p>}
          <div style={{marginBottom:12}}><p style={{fontSize:12,color:P.textMuted,margin:"0 0 6px"}}>vibe tags (optional)</p><TagSelector categories={VIBE_CATEGORIES} tags={VIBE_TAGS} selected={expNote.vibeTags} onChange={v=>setExpNote({...expNote,vibeTags:v,_error:false})} color={P.onHand}/></div>
          {/* Optional mix tag */}
          {!expMix.active&&!expMix.strain&&<button type="button" onClick={()=>setExpMix({...expMix,active:true})} style={{width:"100%",padding:10,borderRadius:8,fontSize:12,background:P.plumLight,color:P.plum,border:`1px dashed ${P.plumBorder}`,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>+ mixed with another strain</button>}
 
          {expMix.active&&!expMix.strain&&<div style={{background:P.plumLight,borderRadius:10,padding:12,marginBottom:12,border:`0.5px solid ${P.plumBorder}`}}>
            <p style={{fontSize:12,fontWeight:500,color:P.plum,margin:"0 0 8px"}}>mixed with:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {onHand.filter(o=>o.strainId!==detailStrain?.id).map(o=>{
                const s2=strains.find(ss=>ss.id===o.strainId);
                return s2?<button key={o.copId} type="button" onClick={()=>setExpMix({active:true,strain:s2})} style={{padding:"6px 12px",borderRadius:8,fontSize:12,background:P.card,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:3,height:14,borderRadius:1,background:typeColor(o.type)}}/>{o.strainName}
                </button>:null;
              })}
            </div>
            <button type="button" onClick={()=>setExpMix({active:false,strain:null})} style={{fontSize:11,color:P.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>cancel</button>
          </div>}
 
          {expMix.strain&&<div style={{background:P.plumLight,borderRadius:8,padding:10,marginBottom:12,border:`0.5px solid ${P.plumBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11,color:P.plum}}>mixed with</span>
              <div style={{width:3,height:14,borderRadius:1,background:typeColor(getLatestCop(expMix.strain).type)}}/>
              <span style={{fontSize:12,fontWeight:500,color:"#5C4A5C"}}>{expMix.strain.name}</span>
              <span style={{fontSize:10,color:P.textMuted}}>{getLatestCop(expMix.strain).type?.toLowerCase()}</span>
            </div>
            <button type="button" onClick={()=>setExpMix({active:false,strain:null})} style={{fontSize:11,color:P.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
          </div>}
 
          <div style={{display:"flex",gap:8}}>
            <button type="button" onClick={()=>reset("mix")} style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>cancel</button>
            <button type="button" onClick={handleSaveExperience} style={{flex:1,padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:P.onHand,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save experience</button>
          </div>
        </div>}
 
        {/* Mix form */}
        {mixMode==="mix"&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.plumBorder}`,marginBottom:16}}>
          {!mixWith?<><p style={{fontSize:12,color:P.textMuted,margin:"0 0 8px"}}>mix with (on hand only):</p><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {onHand.filter(o=>o.strainId!==detailStrain?.id).map(o=><button key={o.copId} onClick={()=>{const s2=strains.find(ss=>ss.id===o.strainId);if(s2)setMixWith(s2);}} style={{padding:"8px 14px",borderRadius:8,fontSize:12,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}><div style={{width:3,height:16,borderRadius:1,background:typeColor(o.type)}}/>{o.strainName}</button>)}
            {onHand.length===0&&<p style={{fontSize:12,color:P.textMuted,margin:0,fontStyle:"italic"}}>no strains on hand — log some sessions first</p>}
          </div><button onClick={()=>reset("mix")} style={{width:"100%",padding:10,borderRadius:8,fontSize:13,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>cancel</button></>
          :<><div style={{background:P.plumLight,borderRadius:10,padding:12,marginBottom:12,border:`0.5px solid ${P.plumBorder}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:16,borderRadius:2,background:typeColor(activeCop.type)}}/><span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{detailStrain.name}</span><span style={{fontSize:10,color:P.textMuted}}>{activeCop.type?.toLowerCase()}</span></div>
              <span style={{fontSize:12,color:P.textMuted}}>x</span>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:16,borderRadius:2,background:typeColor(getLatestCop(mixWith).type)}}/><span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{mixWith.name}</span><span style={{fontSize:10,color:P.textMuted}}>{getLatestCop(mixWith).type?.toLowerCase()}</span></div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{[...new Set([...activeCop.terpenes,...getLatestCop(mixWith).terpenes])].map(t=><span key={t} style={{fontSize:10,background:P.plum,color:P.cream,padding:"2px 8px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>{[...new Set([...(activeCop.session?.tasteTags||[]),...(getLatestCop(mixWith).session?.tasteTags||[])])].map(t=><span key={t} style={{fontSize:10,background:P.terracotta,color:P.cream,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
          </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}><button onClick={()=>handleSaveMix(true)} style={{padding:"8px 14px",borderRadius:8,fontSize:12,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>rate later</button></div>
            <div style={{textAlign:"center",marginBottom:14}}><div style={{display:"flex",justifyContent:"center",gap:6}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setMixSess({...mixSess,rating:n})} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Leaf filled={n<=mixSess.rating} color={P.plum}/></button>)}</div></div>
            <button onClick={()=>setMixSess({...mixSess,bedtime:!mixSess.bedtime})} style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,padding:"6px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",background:mixSess.bedtime?"#2C2C4A":"transparent",color:mixSess.bedtime?"#C9B8F0":P.textMuted,border:mixSess.bedtime?"none":`0.5px solid ${P.border}`}}>🌙 bedtime blunt{mixSess.bedtime&&" ✓"}</button>
            <SpectrumSlider left="Couch-locked" right="Active" value={mixSess.sw} onChange={v=>setMixSess({...mixSess,sw:v})} color={P.plum}/>
            <SpectrumSlider left="Dreamy" right="Analytical" value={mixSess.sf} onChange={v=>setMixSess({...mixSess,sf:v})} color={P.plum}/>
            <SpectrumSlider left="Smooth" right="Harsh" value={mixSess.pull} onChange={v=>setMixSess({...mixSess,pull:v})} color={P.plum}/>
            <div style={{borderTop:`0.5px solid ${P.border}`,paddingTop:12,marginBottom:12}}><p style={{fontSize:12,color:P.textMuted,margin:"0 0 8px"}}>vibe tags</p><TagSelector categories={VIBE_CATEGORIES} tags={VIBE_TAGS} selected={mixSess.vibeTags} onChange={v=>setMixSess({...mixSess,vibeTags:v})} color={P.plum}/></div>
            <textarea value={mixSess.notes} onChange={e=>setMixSess({...mixSess,notes:e.target.value})} placeholder="how'd the combo play..." rows={2} style={{width:"100%",boxSizing:"border-box",background:P.bg,borderRadius:8,padding:"10px 14px",fontSize:14,color:P.text,border:`0.5px solid ${P.border}`,fontFamily:"inherit",outline:"none",resize:"vertical",marginBottom:14}}/>
            <div style={{display:"flex",gap:8}}><button onClick={()=>reset("mix")} style={{flex:1,padding:10,borderRadius:8,fontSize:13,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>cancel</button><button onClick={()=>handleSaveMix(false)} style={{flex:1,padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:P.plum,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>save mix</button></div>
          </>}
        </div>}
      </>}
    </Wrapper>);}
 
  // ═══ MAIN VIEW ═══
  return(<div style={{background:P.bg,minHeight:"100vh",fontFamily:"'DM Sans','Nunito',sans-serif"}}><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet"/><div style={{maxWidth:480,margin:"0 auto",padding:"20px 20px 100px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
      <div><h1 style={{fontSize:28,fontWeight:500,margin:0,color:P.text,fontFamily:"'Playfair Display',serif"}}>c<span style={{textTransform:"uppercase",letterSpacing:2}}>loud</span></h1><p style={{fontSize:13,color:P.textMuted,margin:"4px 0 0"}}>your terpene journal</p></div>
      <button onClick={()=>setShowGuide(!showGuide)} style={{background:showGuide?P.text:"transparent",color:showGuide?P.cream:P.textMuted,border:showGuide?"none":`0.5px solid ${P.border}`,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>?</button>
    </div>
 
    {showGuide&&<div style={{background:P.card,borderRadius:12,padding:20,border:`0.5px solid ${P.border}`,marginBottom:20}}>
      <p style={{fontSize:15,fontWeight:500,color:P.text,margin:"0 0 16px",fontFamily:"'Playfair Display',serif"}}>how to use cLOUD</p>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:P.terracotta,margin:"0 0 4px"}}>📦 re-ups & copping</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>tap + to start. pick or create a re-up (your haul — max 2 open at a time), then log each strain you bought. enter the name, type, source, terpenes, and any first impressions. for dispensary cops, you can also log packaging (bag or jar), brand, and grow type (indoor, greenhouse, or outdoor). all your copped strains land in "ready to try." dates are based on when you log, so cop right when you buy.</p>
      </div>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:P.sage,margin:"0 0 4px"}}>🍃 first session</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>smoke a strain solo for the first time, then log your first session. rate the vibe (1-5 leaves), set the spectrums (couch-locked↔active, dreamy↔analytical), tag how it made you feel, and note whether you'd cop again. toggle 🌙 bedtime if it's your nighttime blunt. this is your baseline — the true read on the strain by itself. once logged, it moves to "on hand."</p>
      </div>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:P.onHand,margin:"0 0 4px"}}>📝 notes & experiences</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>while a strain is on hand, use <b style={{color:P.text,fontWeight:500}}>notes</b> for quick thoughts — anything worth jotting down in the moment. use <b style={{color:P.text,fontWeight:500}}>experiences</b> when something notably different happens — smoked outside, tried it as a bedtime blunt, or mixed with another strain. experiences capture setting, vibes, and context. you can edit or delete notes and experiences anytime while on hand.</p>
      </div>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:P.plum,margin:"0 0 4px"}}>💨 mixes</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>log a <b style={{color:P.text,fontWeight:500}}>mix</b> the first time two on-hand strains come together. this gets the full rating — spectrums, vibes, the works. the mix shows up on both strains. if you smoke that same mix again and something stands out, log it as an <b style={{color:P.text,fontWeight:500}}>experience</b> with "mixed with" toggled on. you can rate a mix now or queue it for later.</p>
      </div>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:"#C9A84C",margin:"0 0 4px"}}>⭐ starring</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>star any strain you can't stop thinking about. starred strains show up in your library for easy access — even after the bag is long gone. never-again strains can't be starred.</p>
      </div>
 
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 4px"}}>✅ finishing up</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>when a strain is done, tap "finished." the app asks if your cop-again answer changed — this is your second and final chance to update it. once finished, everything on that cop locks — no more edits or deletes. when all strains in a re-up are finished, it auto-closes and moves to your history.</p>
      </div>
 
      <div>
        <p style={{fontSize:13,fontWeight:500,color:P.textMuted,margin:"0 0 4px"}}>📚 library</p>
        <p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.5}}>browse starred strains, search across everything (names, parents, terpenes, tags, notes, mixes), filter by cop-again and rating, check out your mix library, revisit legacy strains, and dig into insights — terpene affinity, type breakdowns, brands, and your outdoor report. the suggestions tab recommends strains based on your favorites' genetics.</p>
      </div>
 
      <button onClick={()=>setShowGuide(false)} style={{width:"100%",marginTop:16,padding:10,borderRadius:8,fontSize:13,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>got it</button>
    </div>}
 
    {tab==="active"&&<div>
      {/* Mix queue */}
      {mixQueue.length>0&&<><SectionLabel>needs review</SectionLabel>{mixQueue.map(q=><div key={q.id} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,border:`1.5px dashed ${P.plum}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:3,height:14,borderRadius:1,background:typeColor(q.primaryType)}}/><span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{q.primaryStrain}</span></div>
            <span style={{fontSize:11,color:P.textMuted}}>x</span>
            <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:3,height:14,borderRadius:1,background:typeColor(q.withType)}}/><span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{q.withStrain}</span></div>
          </div>
          <span style={{fontSize:10,background:P.plum,color:P.cream,padding:"2px 8px",borderRadius:10}}>mix</span>
        </div>{q.combinedTerpenes&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>{q.combinedTerpenes.map(t=><span key={t} style={{fontSize:10,background:P.plum,color:P.cream,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>}<button onClick={()=>handleReviewMix(q)} style={{width:"100%",padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:P.plum,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>review this mix</button></div>)}<div style={{margin:"16px 0",borderTop:`1px solid ${P.border}`}}/></>}
 
      {/* Copped */}
      {coppedEntries.length>0&&<><SectionLabel>ready to try</SectionLabel>{coppedEntries.map(e=><div key={e.id} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,border:`1.5px dashed ${P.terracotta}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><TypeBadge type={e.type}/><p style={{fontWeight:500,fontSize:15,margin:0,color:P.text}}>{e.strainName}</p><span style={{fontSize:10,background:P.terracotta,color:P.cream,padding:"2px 8px",borderRadius:10,fontWeight:500}}>copped</span>{e.strainId&&<span style={{fontSize:10,color:P.sage}}>re-cop</span>}{e.intent&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:e.intent==="asleep"?"#1A1A2E":e.intent==="awake"?"#FFF3E8":"#EDF2E8",color:e.intent==="asleep"?"#C9B8F0":e.intent==="awake"?"#C17F4A":"#6B7F5A",border:e.intent==="awake"?`0.5px solid #E8D0B0`:"none"}}>{e.intent==="asleep"?"🌙":e.intent==="awake"?"☀️":"🏕️"}</span>}</div>
        <p style={{fontSize:12,color:P.textMuted,margin:"2px 0 6px"}}>{[e.type?.toLowerCase(),e.lean?.toLowerCase(),e.source==="TL"?"TL":e.source?.toLowerCase(),e.date].filter(Boolean).join(" · ")}</p>
        {e.terpenes?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>{e.terpenes.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>}
        {!e.intent&&<div style={{display:"flex",gap:4,marginBottom:8}}>{["asleep","awake","adventure"].map(i=><button key={i} onClick={()=>setCoppedIntent(e.id,i)} style={{fontSize:10,padding:"3px 9px",borderRadius:8,border:`0.5px solid ${P.border}`,background:P.bg,color:P.textMuted,cursor:"pointer",fontFamily:"inherit"}}>{i==="asleep"?"🌙":i==="awake"?"☀️":"🏕️"} {i}</button>)}</div>}
        {!e.amount&&<div style={{display:"flex",gap:4,marginBottom:8}}>{["8th","quarter","half","oz"].map(a=><button key={a} onClick={()=>setCoppedAmount(e.id,a)} style={{fontSize:10,padding:"3px 9px",borderRadius:8,border:`0.5px solid ${P.border}`,background:P.bg,color:P.textMuted,cursor:"pointer",fontFamily:"inherit"}}>{a}</button>)}</div>}
        <button onClick={()=>{setEditEntry(e);setView("session");}} style={{width:"100%",padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:P.terracotta,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>log first session</button>
      </div>)}<div style={{margin:"16px 0",borderTop:`1px solid ${P.border}`}}/></>}
 
      {/* On hand */}
      {onHand.length>0&&<><SectionLabel>on hand</SectionLabel>{onHand.map(o=>{const s=strains.find(ss=>ss.id===o.strainId);const intent=s?.intent;return(<div key={o.copId} style={{background:P.onHandLight,borderRadius:12,padding:14,marginBottom:8,border:`1px solid ${P.onHand}40`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><TypeBadge type={o.type}/><p style={{fontWeight:500,fontSize:15,margin:0,color:P.text}}>{o.strainName}</p><span style={{fontSize:10,background:P.onHand,color:P.cream,padding:"2px 8px",borderRadius:10,fontWeight:500}}>on hand</span>{intent&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:intent==="asleep"?"#1A1A2E":intent==="awake"?"#FFF3E8":"#EDF2E8",color:intent==="asleep"?"#C9B8F0":intent==="awake"?"#C17F4A":"#6B7F5A",border:intent==="awake"?`0.5px solid #E8D0B0`:"none"}}>{intent==="asleep"?"🌙":intent==="awake"?"☀️":"🏕️"}</span>}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>{o.terpenes.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
        <div style={{display:"flex",gap:6}}>
          {s&&<button onClick={()=>openDetail(s)} style={{flex:1,padding:8,borderRadius:8,fontSize:12,background:P.card,color:P.text,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>view</button>}
          <button onClick={()=>handleMarkDone(o)} style={{flex:1,padding:8,borderRadius:8,fontSize:12,background:P.surface,color:P.textMuted,border:"none",cursor:"pointer",fontFamily:"inherit"}}>finished ✓</button>
        </div>
        {finishingCop?.copId===o.copId&&<div style={{marginTop:10,paddingTop:10,borderTop:`0.5px solid ${P.border}`}}>
          <p style={{fontSize:12,fontWeight:500,color:P.text,margin:"0 0 8px"}}>now that it's done — would you still cop again?</p>
          <div style={{display:"flex",gap:5,marginBottom:10}}>{["Yes","Maybe","No","Never again"].map(v=><button key={v} onClick={()=>setFinishCopAgain(v)} style={{flex:1,padding:"8px 2px",borderRadius:8,fontSize:v==="Never again"?10:12,fontFamily:"inherit",cursor:"pointer",fontWeight:finishCopAgain===v?500:400,background:finishCopAgain===v?copAgainColor(v):P.bg,color:finishCopAgain===v?P.cream:P.textMuted,border:finishCopAgain===v?"none":`0.5px solid ${P.border}`}}>{v.toLowerCase()}</button>)}</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setFinishingCop(null);setFinishCopAgain("");}} style={{flex:1,padding:8,borderRadius:8,fontSize:12,background:P.bg,color:P.textMuted,border:`0.5px solid ${P.border}`,cursor:"pointer",fontFamily:"inherit"}}>cancel</button>
            <button onClick={handleConfirmDone} style={{flex:1,padding:8,borderRadius:8,fontSize:12,fontWeight:500,background:P.sage,color:P.cream,border:"none",cursor:"pointer",fontFamily:"inherit"}}>{finishCopAgain?"confirm — "+finishCopAgain.toLowerCase():"keep original answer"}</button>
          </div>
        </div>}
      </div>);})}<div style={{margin:"16px 0",borderTop:`1px solid ${P.border}`}}/></>}
 
      {coppedEntries.length===0&&onHand.length===0&&mixQueue.length===0&&<div style={{background:P.card,borderRadius:12,padding:32,border:`0.5px solid ${P.border}`,textAlign:"center",marginBottom:20}}><p style={{fontSize:14,color:P.textMuted,margin:0}}>nothing active — tap + to log a new cop</p></div>}
 
      {finishedReups.length>0&&<><SectionLabel>finished re-ups</SectionLabel>
        {finishedReups.slice(0,5).map(r=><div key={r.id} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,border:`0.5px solid ${P.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:500,color:P.text}}>📦 re-up · {r.date}</span>
            <span style={{fontSize:10,color:P.textMuted}}>closed {r.closedDate}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {r.strainNames?.map((n,i)=><span key={i} style={{fontSize:11,background:P.surface,color:P.textWarm,padding:"3px 8px",borderRadius:8}}>{n}</span>)}
          </div>
        </div>)}
        <div style={{margin:"16px 0",borderTop:`1px solid ${P.border}`}}/></>}
 
      <SectionLabel>recently completed</SectionLabel>
      {(()=>{
        const completed=strains.flatMap(s=>s.cops.filter(c=>c.status==="done"&&c.session).map(c=>({strain:s,cop:c})));
        completed.sort((a,b)=>(b.cop.id||0)-(a.cop.id||0));
        return completed.slice(0,15).map(({strain:s,cop:lc})=>{const ls=lc.session;return(<div key={lc.id} onClick={()=>openDetail(s)} style={{background:isNeverAgain(s)?P.redLight:P.card,borderRadius:12,padding:14,marginBottom:8,cursor:"pointer",border:isNeverAgain(s)?`1px solid ${P.red}40`:`0.5px solid ${P.border}`,display:"flex",gap:10}}>
          <TypeBadge type={lc.type}/><div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div><p style={{fontWeight:500,fontSize:15,margin:0,color:P.text}}>{s.name}{s.starred&&<span style={{marginLeft:6}}>⭐</span>}</p><p style={{fontSize:11,color:P.textMuted,margin:"2px 0 0"}}>{[lc.type?.toLowerCase(),fmtSource(lc.source),lc.date].filter(Boolean).join(" · ")}</p></div><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=ls.rating} size={16} color={ls.copAgain==="Never again"?P.red:P.sage}/>)}</div></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:4}}>{lc.terpenes?.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
            <div style={{display:"flex",gap:6,fontSize:10,color:P.textMuted}}>{s.cops.length>1&&<span style={{color:P.sage,fontWeight:500}}>{s.cops.length} cops</span>}<span style={{background:copAgainColor(ls.copAgain),color:P.cream,padding:"1px 6px",borderRadius:8}}>{"🔄 "+ls.copAgain.toLowerCase()}</span></div>
          </div></div>);});
      })()}
    </div>}
 
    {tab==="library"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>{["strains","mixes","legacy","insights"].map(t=><button key={t} onClick={()=>setLibSubTab(t)} style={{background:libSubTab===t?P.text:"transparent",color:libSubTab===t?P.cream:P.textMuted,fontSize:13,padding:"6px 16px",borderRadius:20,fontWeight:libSubTab===t?500:400,border:libSubTab===t?"none":`1px solid ${P.borderDark}`,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>)}</div>
 
      {libSubTab==="strains"&&<div>
        <div style={{display:"flex",gap:4,marginBottom:16,overflowX:"auto"}}>
          {[{k:"starred",l:"⭐ starred"},{k:"suggestions",l:"✨ suggestions"},{k:"search",l:"search"},{k:"filters",l:"filters"}].map(t=>
            <button key={t.k} onClick={()=>setSearchSubTab(t.k)} style={{flex:1,padding:"8px 10px",borderRadius:8,fontSize:11,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",fontWeight:searchSubTab===t.k?500:400,background:searchSubTab===t.k?P.sage:P.bg,color:searchSubTab===t.k?P.cream:P.textMuted,border:searchSubTab===t.k?"none":`0.5px solid ${P.border}`}}>{t.l}</button>
          )}
        </div>
 
        {searchSubTab==="starred"&&<div>
          <p style={{fontSize:12,color:P.textMuted,margin:"0 0 10px"}}>{starredStrains.length} starred strain{starredStrains.length!==1?"s":""}</p>
          {starredStrains.length===0?<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}>
            <p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no starred strains yet</p>
            <p style={{fontSize:12,color:P.textMuted,margin:0}}>tap the ⭐ on any strain you can't stop thinking about</p>
          </div>:starredStrains.map(s=>{const ls=getLatestSession(s);const lc=getLatestCop(s);if(!ls)return null;return(<div key={s.id} onClick={()=>openDetail(s)} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,cursor:"pointer",border:`0.5px solid ${P.border}`,display:"flex",gap:10}}>
            <TypeBadge type={lc.type}/><div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>⭐</span><p style={{fontWeight:500,fontSize:15,margin:0,color:P.text}}>{s.name}</p></div><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=ls.rating} size={16}/>)}</div></div></div>
              <p style={{fontSize:11,color:P.textMuted,margin:"0 0 4px"}}>{[typeSummary(s),s.cops.length>1?s.cops.length+" cops":null].filter(Boolean).join(" · ")}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{lc.terpenes?.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
            </div></div>);})}
        </div>}
 
        {searchSubTab==="suggestions"&&<div>
          {(()=>{
            const favorites=strains.filter(s=>!s.legacy&&!isNeverAgain(s)&&!s.unknownLineage&&(s.starred||s.cops.some(c=>c.session?.rating===5)));
            const existingNames=new Set(strains.map(s=>s.name.toLowerCase().trim()));
            const parentMap={};
            favorites.forEach(fav=>{
              (fav.parents||[]).forEach(p=>{
                if(!p||!p.trim())return;
                const key=p.trim();
                if(existingNames.has(key.toLowerCase()))return;
                if(!parentMap[key])parentMap[key]={name:key,from:[]};
                parentMap[key].from.push(fav.name);
              });
            });
            const suggestions=Object.values(parentMap).sort((a,b)=>b.from.length-a.from.length||a.name.localeCompare(b.name));
            if(favorites.length===0)return(<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}>
              <p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no suggestions yet</p>
              <p style={{fontSize:12,color:P.textMuted,margin:0}}>star a strain or rate one 5 leaves to start getting suggestions ✨</p>
            </div>);
            if(suggestions.length===0)return(<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}>
              <p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no new strains to suggest</p>
              <p style={{fontSize:12,color:P.textMuted,margin:0}}>add parent info to your favorites to unlock more suggestions</p>
            </div>);
            return(<>
              <p style={{fontSize:12,color:P.textMuted,margin:"0 0 10px"}}>based on the genetics of {favorites.length} favorite{favorites.length>1?"s":""} · {suggestions.length} suggestion{suggestions.length>1?"s":""}</p>
              {suggestions.map(sug=>(<div key={sug.name} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,border:`0.5px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>✨</span>
                  <p style={{fontSize:14,fontWeight:500,color:P.text,margin:0}}>{sug.name}</p>
                </div>
                <span style={{fontSize:11,color:P.sage,fontWeight:500,background:"#EDF2E8",padding:"3px 10px",borderRadius:10}}>×{sug.from.length} favorite{sug.from.length>1?"s":""}</span>
              </div>))}
            </>);
          })()}
        </div>}
 
        {searchSubTab==="search"&&<div>
          <div style={{background:P.card,borderRadius:10,padding:"10px 14px",border:`0.5px solid ${P.border}`,marginBottom:14}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="search names, terpenes, taste, vibes, notes..." style={{border:"none",background:"transparent",width:"100%",fontSize:14,color:P.text,outline:"none",fontFamily:"inherit"}}/>
          </div>
          {!searchQ.trim()?<p style={{fontSize:12,color:P.textMuted,margin:0,fontStyle:"italic",textAlign:"center",padding:24}}>start typing to search across everything</p>
          :<>
            <p style={{fontSize:12,color:P.textMuted,margin:"0 0 10px"}}>{textSearchResults.length} match{textSearchResults.length!==1?"es":""}</p>
            {textSearchResults.map(s=>{const ls=getLatestSession(s);const lc=getLatestCop(s);if(!ls)return null;return(<div key={s.id} onClick={()=>openDetail(s)} style={{background:isNeverAgain(s)?P.redLight:P.card,borderRadius:12,padding:14,marginBottom:8,cursor:"pointer",border:isNeverAgain(s)?`1px solid ${P.red}40`:`0.5px solid ${P.border}`,display:"flex",gap:10}}>
              <TypeBadge type={lc.type}/><div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><p style={{fontWeight:500,fontSize:14,margin:0,color:P.text}}>{s.name}{s.starred&&<span style={{marginLeft:6}}>⭐</span>}</p><span style={{fontSize:10,background:copAgainColor(ls.copAgain),color:P.cream,padding:"2px 6px",borderRadius:8}}>{"🔄 "+ls.copAgain.toLowerCase()}</span></div>
                <p style={{fontSize:11,color:P.textMuted,margin:"0 0 4px"}}>{typeSummary(s)}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{lc.terpenes?.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
              </div></div>);})}
          </>}
        </div>}
 
        {searchSubTab==="filters"&&<div>
          <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:13,fontWeight:500,color:P.text,margin:"0 0 12px"}}>filter by</p>
            <div style={{marginBottom:14}}>
              <p style={{fontSize:12,color:P.textMuted,margin:"0 0 6px"}}>would cop again</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {["","Yes","Maybe"].map(v=><Pill key={v||"any"} active={filters.copAgain===v} color={v?copAgainColor(v):P.sage} onClick={()=>setFilters({...filters,copAgain:v})}>{(v||"any").toLowerCase()}</Pill>)}
              </div>
            </div>
            <div>
              <p style={{fontSize:12,color:P.textMuted,margin:"0 0 6px"}}>min rating</p>
              <div style={{display:"flex",gap:4}}>
                {[0,3,4,5].map(v=><Pill key={v} active={filters.minRating===v} color={P.sage} onClick={()=>setFilters({...filters,minRating:v})}>{v===0?"any":v+"+ leaves"}</Pill>)}
              </div>
            </div>
            {availableMonths.length>0&&<div style={{marginTop:14}}>
              <p style={{fontSize:12,color:P.textMuted,margin:"0 0 6px"}}>month</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                <Pill active={filters.month===""} color={P.sage} onClick={()=>setFilters({...filters,month:""})}>any</Pill>
                {availableMonths.map(m=><Pill key={m} active={filters.month===m} color={P.terracotta} onClick={()=>setFilters({...filters,month:m})}>{m.toLowerCase()}</Pill>)}
              </div>
            </div>}
          </div>
          <p style={{fontSize:12,color:P.textMuted,margin:"0 0 10px"}}>{filteredStrains.length} result{filteredStrains.length!==1?"s":""}</p>
          {filteredStrains.map(s=>{const ls=getLatestSession(s);const lc=getLatestCop(s);if(!ls)return null;return(<div key={s.id} onClick={()=>openDetail(s)} style={{background:P.card,borderRadius:12,padding:14,marginBottom:8,cursor:"pointer",border:`0.5px solid ${P.border}`,display:"flex",gap:10}}>
            <TypeBadge type={lc.type}/><div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><p style={{fontWeight:500,fontSize:14,margin:0,color:P.text}}>{s.name}{s.starred&&<span style={{marginLeft:6}}>⭐</span>}</p><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=ls.rating} size={14}/>)}</div></div>
              <p style={{fontSize:11,color:P.textMuted,margin:"0 0 4px"}}>{typeSummary(s)} · {ls.copAgain.toLowerCase()}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{lc.terpenes?.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 6px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div>
            </div></div>);})}
        </div>}
      </div>}
 
      {libSubTab==="mixes"&&<div>
        {(()=>{
          const reviewed=allMixes.filter(m=>m.status==="reviewed");
          const sorted=[...reviewed].sort((a,b)=>b.rating-a.rating);
          const unique=[];const seen=new Set();
          sorted.forEach(m=>{const key=[m.strain.name,m.withStrain].sort().join("|");if(!seen.has(key)){seen.add(key);unique.push(m);}});
          if(unique.length===0)return(<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}>
            <p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no mixes yet</p>
            <p style={{fontSize:12,color:P.textMuted,margin:0}}>mix two on-hand strains from a strain's detail view</p>
          </div>);
          return(<>
            <p style={{fontSize:12,color:P.textMuted,margin:"0 0 12px"}}>{unique.length} mix{unique.length!==1?"es":""} · sorted by rating</p>
            {unique.map(m=>(
              <div key={m.id} style={{background:P.plumLight,borderRadius:12,padding:14,marginBottom:8,border:`0.5px solid ${P.plumBorder}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:3,height:14,borderRadius:1,background:typeColor(m.primaryType||m.cop?.type)}}/>
                    <span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{m.strain.name}</span>
                    <span style={{fontSize:11,color:P.textMuted}}>x</span>
                    <div style={{width:3,height:14,borderRadius:1,background:typeColor(m.withType)}}/>
                    <span style={{fontSize:13,fontWeight:500,color:"#5C4A5C"}}>{m.withStrain}</span>
                  </div>
                  <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=m.rating} color={P.plum}/>)}</div>
                </div>
                {m.combinedTerpenes&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:4}}>{m.combinedTerpenes.map(t=><span key={t} style={{fontSize:9,background:P.plum,color:P.cream,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
                {m.vibeTags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:4}}>{m.vibeTags.map(t=><span key={t} style={{fontSize:9,background:"#D4C0D4",color:"#5C4A5C",padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
                {m.notes&&<p style={{fontSize:11,color:"#5C4A5C",margin:"4px 0 0",fontStyle:"italic"}}>{m.notes}</p>}
                <p style={{fontSize:10,color:P.textMuted,margin:"4px 0 0"}}>{m.date}</p>
              </div>
            ))}
          </>);
        })()}
      </div>}
 
      {libSubTab==="legacy"&&<div>
        <p style={{fontSize:12,color:P.textMuted,margin:"0 0 16px"}}>{legacyStrains.length} strain{legacyStrains.length!==1?"s":""} from before cLOUD</p>
 
        {/* Never again */}
        {legacyStrains.filter(l=>l.copAgain==="Never again").length>0&&<>
          <SectionLabel>🔒 never again</SectionLabel>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {legacyStrains.filter(l=>l.copAgain==="Never again").map(l=><span key={l.id} style={{fontSize:12,background:P.redLight,color:P.red,padding:"6px 14px",borderRadius:10,fontWeight:500,border:`1px solid ${P.red}40`}}>{l.name}</span>)}
          </div>
        </>}
 
        {/* Strains with notes/type/source - the ones with stories */}
        {(()=>{
          const detailed=legacyStrains.filter(l=>l.copAgain!=="Never again"&&(l.notes||l.type||l.source||l.brand));
          const nameOnly=legacyStrains.filter(l=>l.copAgain!=="Never again"&&!l.notes&&!l.type&&!l.source&&!l.brand);
          return(<>
            {detailed.length>0&&<><SectionLabel>strains + notes</SectionLabel>
              {detailed.map(l=><div key={l.id} style={{background:P.card,borderRadius:10,padding:12,marginBottom:6,border:`0.5px solid ${P.border}`,borderLeft:l.type?`4px solid ${typeColor(l.type)}`:`4px solid ${P.borderDark}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:(l.notes||l.brand)?4:0}}>
                  <p style={{fontWeight:500,fontSize:14,margin:0,color:P.text}}>{l.name}</p>
                  <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {l.type&&<span style={{fontSize:10,color:P.textMuted}}>{l.type.toLowerCase()}</span>}
                    {l.source&&<span style={{fontSize:10,color:P.textMuted}}>· {l.source==="TL"?"TL":l.source.toLowerCase()}{l.container?` · ${l.container.toLowerCase()}`:""}</span>}
                    <span style={{fontSize:10,background:copAgainColor(l.copAgain),color:P.cream,padding:"2px 6px",borderRadius:8}}>🔄 {l.copAgain.toLowerCase()}</span>
                  </div>
                </div>
                {l.brand&&<p style={{fontSize:11,color:P.textMuted,margin:"0 0 4px"}}>🏷️ {l.brand}</p>}
                {l.notes&&<p style={{fontSize:12,color:P.textMuted,margin:0,lineHeight:1.4}}>{l.notes}</p>}
              </div>)}
            </>}
 
            {nameOnly.length>0&&<><div style={{marginTop:detailed.length>0?14:0}}><SectionLabel>also loved</SectionLabel></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {nameOnly.map(l=><span key={l.id} style={{fontSize:12,background:P.card,color:P.text,padding:"8px 14px",borderRadius:10,fontWeight:500,border:`0.5px solid ${P.border}`}}>{l.name}</span>)}
              </div>
            </>}
          </>);
        })()}
      </div>}
 
      {libSubTab==="insights"&&<div>
        <p style={{fontSize:13,color:P.textMuted,margin:"0 0 16px"}}>based on {strains.length} strains · {allSessionCops.length} cops</p>
        
        <div style={{display:"flex",gap:4,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          {[{k:"terpenes",l:"terpenes"},{k:"types",l:"types"},{k:"brands",l:"brands"},{k:"outdoor",l:"🌿 outdoor"},{k:"bedtime",l:"🌙 bedtime"},{k:"intent",l:"🎯 intent"}].map(t=>(
            <button key={t.k} onClick={()=>setInsightTab(t.k)} style={{padding:"6px 12px",borderRadius:14,fontSize:11,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",background:insightTab===t.k?P.sage:"transparent",color:insightTab===t.k?P.cream:P.textMuted,border:insightTab===t.k?"none":`1px solid ${P.borderDark}`,fontWeight:insightTab===t.k?500:400}}>{t.l}</button>
          ))}
        </div>
 
        {/* TERPENE AFFINITY */}
        {insightTab==="terpenes"&&<div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{["pure","mixes"].map(m=><button key={m} onClick={()=>setInsightMode(m)} style={{flex:1,padding:"8px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",fontWeight:insightMode===m?500:400,background:insightMode===m?(m==="pure"?P.sage:P.plum):P.bg,color:insightMode===m?P.cream:P.textMuted,border:insightMode===m?"none":`0.5px solid ${P.border}`}}>{m}</button>)}</div>
          <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>terpene affinity — {insightMode}</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 16px"}}>{insightMode==="pure"?"your top terpenes from solo sessions":"terpenes in your highest-rated mixes"} · {activeTotal} {insightMode==="pure"?"cops":"mixes"}</p>
            {activeTerpRanked.length>0?<ResponsiveContainer width="100%" height={activeTerpRanked.slice(0,7).length*44+20}>
              <BarChart data={activeTerpRanked.slice(0,7).map(t=>({...t,name:t.name.toLowerCase()}))} layout="vertical" margin={{left:0,right:40,top:0,bottom:0}}>
                <XAxis type="number" domain={[0,5]} hide/>
                <YAxis type="category" dataKey="name" width={90} tick={{fontSize:12,fill:P.text}} axisLine={false} tickLine={false}/>
                <Tooltip content={({active,payload})=>{if(!active||!payload?.[0])return null;const d=payload[0].payload;return(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontSize:12}}><p style={{margin:0,fontWeight:500,color:P.text}}>{d.name}</p><p style={{margin:"4px 0 0",color:P.sage}}>{d.avg.toFixed(1)} avg</p></div>);}}/>
                <Bar dataKey="avg" radius={[0,6,6,0]} barSize={20}>
                  {activeTerpRanked.slice(0,7).map((t,i)=><Cell key={i} fill={t.avg>=4?(insightMode==="pure"?P.sage:P.plum):t.avg>=3?P.terracotta:P.textMuted}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>:<p style={{fontSize:12,color:P.textMuted}}>no {insightMode==="pure"?"sessions":"mixes"} logged yet</p>}
          </div>
          {insightMode==="pure"&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>cop again rates</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>by terpene</p>
            {terpRanked.slice(0,5).map(t=><div key={t.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:12,color:P.text,width:80}}>{t.name.toLowerCase()}</span>
              <div style={{flex:1,height:20,background:P.border,borderRadius:10,overflow:"hidden",display:"flex"}}>
                <div style={{width:`${t.copPct}%`,height:"100%",background:P.sage,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6}}>
                  {t.copPct>20&&<span style={{fontSize:9,color:P.cream,fontWeight:500}}>{t.copPct}%</span>}
                </div>
              </div>
              {t.copPct<=20&&<span style={{fontSize:10,color:P.textMuted}}>{t.copPct}%</span>}
            </div>)}
          </div>}
        </div>}
 
        {/* TYPE BREAKDOWN */}
        {insightTab==="types"&&<div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>{["pure","mixes"].map(m=><button key={m} onClick={()=>setInsightMode(m)} style={{flex:1,padding:"8px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",fontWeight:insightMode===m?500:400,background:insightMode===m?(m==="pure"?P.sage:P.plum):P.bg,color:insightMode===m?P.cream:P.textMuted,border:insightMode===m?"none":`0.5px solid ${P.border}`}}>{m}</button>)}</div>
          <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>type breakdown — {insightMode}</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 16px"}}>{insightMode==="pure"?"types across your solo sessions":"types that show up in your mixes"}</p>
            {activeTypeData.length>0?<div style={{display:"flex",alignItems:"center",gap:20}}>
              <div style={{width:140,height:140}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activeTypeData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                      {activeTypeData.map((d,i)=><Cell key={i} fill={typeColors[d.name]||P.textMuted}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"relative",top:-90,textAlign:"center",pointerEvents:"none"}}>
                  <p style={{fontSize:20,fontWeight:500,color:P.text,margin:0}}>{activeTotal}</p>
                  <p style={{fontSize:10,color:P.textMuted,margin:0}}>{insightMode==="pure"?"cops":"mixes"}</p>
                </div>
              </div>
              <div style={{flex:1}}>
                {activeTypeData.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:10,height:10,borderRadius:3,background:typeColors[d.name]||P.textMuted}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:P.text}}>{d.name.toLowerCase()}</span><span style={{fontSize:11,color:P.textMuted}}>{d.count}</span></div>
                    <p style={{fontSize:11,color:P.sage,margin:"2px 0 0"}}>{d.avg} avg</p>
                  </div>
                </div>)}
              </div>
            </div>:<p style={{fontSize:12,color:P.textMuted}}>no {insightMode==="pure"?"sessions":"mixes"} logged yet</p>}
          </div>
          {insightMode==="pure"&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>label vs reality</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>how often does a strain smoke as labeled?</p>
            {(()=>{const match=allSessionCops.filter(c=>c.session.smokesLike);const correct=match.filter(c=>c.session.smokesLike===c.type);const pct=match.length?Math.round((correct.length/match.length)*100):0;
              return(<div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{fontSize:28,fontWeight:500,color:pct>70?P.sage:P.terracotta}}>{pct}%</div>
                  <p style={{fontSize:12,color:P.textMuted,margin:0}}>of strains smoke as labeled<br/>({correct.length} of {match.length})</p>
                </div>
                {["Sativa","Indica","Hybrid"].map(type=>{const ofType=match.filter(c=>c.type===type);const correctOfType=ofType.filter(c=>c.session.smokesLike===type);const typePct=ofType.length?Math.round((correctOfType.length/ofType.length)*100):0;
                  return ofType.length>0?<div key={type} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:8,height:8,borderRadius:2,background:typeColors[type]}}/>
                    <span style={{fontSize:12,color:P.text,width:60}}>{type.toLowerCase()}</span>
                    <div style={{flex:1,height:16,background:P.border,borderRadius:8,overflow:"hidden"}}><div style={{width:`${typePct}%`,height:"100%",background:typeColors[type],borderRadius:8}}/></div>
                    <span style={{fontSize:11,color:P.textMuted,width:36,textAlign:"right"}}>{typePct}%</span>
                  </div>:null;
                })}
              </div>);
            })()}
          </div>}
        </div>}
 
        {/* BRANDS */}
        {insightTab==="brands"&&<div>
          <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>dispensary brands</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 16px"}}>how your brands stack up</p>
            {brandRanked.length>0?brandRanked.map(b=>(
              <div key={b.name} style={{background:P.bg,borderRadius:10,padding:14,marginBottom:8,border:`0.5px solid ${P.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <p style={{fontSize:14,fontWeight:500,color:P.text,margin:0}}>{b.name}</p>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=Math.round(b.avg)}/>)}</div>
                    <span style={{fontSize:12,fontWeight:500,color:P.sage}}>{b.avg}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,fontSize:11,color:P.textMuted}}>
                  <span>{b.count} cop{b.count>1?"s":""}</span>
                  <span>{b.copPct}% would cop again</span>
                </div>
                <div style={{marginTop:8,height:6,background:P.border,borderRadius:3}}>
                  <div style={{height:6,background:b.avg>=4?P.sage:b.avg>=3?P.terracotta:P.red,borderRadius:3,width:`${(b.avg/5)*100}%`}}/>
                </div>
              </div>
            )):<div style={{textAlign:"center",padding:16}}>
              <p style={{fontSize:12,color:P.textMuted,margin:0}}>no dispensary brands logged yet</p>
              <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>add a brand when you cop from a dispensary to start tracking</p>
            </div>}
          </div>
 
          {brandRanked.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>brand comparison</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 16px"}}>TL vs dispensary brands</p>
            {(()=>{
              const tlCops=allSessionCops.filter(c=>c.source==="TL");
              const dispCops=allSessionCops.filter(c=>c.source==="Dispensary");
              const tlAvg=tlCops.length?+(tlCops.reduce((a,c)=>a+c.session.rating,0)/tlCops.length).toFixed(1):0;
              const dispAvg=dispCops.length?+(dispCops.reduce((a,c)=>a+c.session.rating,0)/dispCops.length).toFixed(1):0;
              return(<div style={{display:"flex",gap:12}}>
                <div style={{flex:1,background:P.bg,borderRadius:10,padding:14,textAlign:"center",border:`0.5px solid ${P.border}`}}>
                  <p style={{fontSize:22,fontWeight:500,color:P.text,margin:0}}>{tlAvg||"—"}</p>
                  <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>TL avg</p>
                  <p style={{fontSize:10,color:P.textMuted,margin:"2px 0 0"}}>{tlCops.length} cop{tlCops.length!==1?"s":""}</p>
                </div>
                <div style={{flex:1,background:P.bg,borderRadius:10,padding:14,textAlign:"center",border:`0.5px solid ${P.border}`}}>
                  <p style={{fontSize:22,fontWeight:500,color:P.text,margin:0}}>{dispAvg||"—"}</p>
                  <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>dispensary avg</p>
                  <p style={{fontSize:10,color:P.textMuted,margin:"2px 0 0"}}>{dispCops.length} cop{dispCops.length!==1?"s":""}</p>
                </div>
              </div>);
            })()}
          </div>}
 
          {allSessionCops.some(c=>c.growType)&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginTop:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>🌱 grow type preference</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 14px"}}>based on your ratings + cop-again</p>
            {(()=>{
              const ig=allSessionCops.filter(c=>c.growType==="Indoor grown");
              const gh=allSessionCops.filter(c=>c.growType==="Greenhouse grown");
              const og=allSessionCops.filter(c=>c.growType==="Outdoor grown");
              const stats=arr=>({
                count:arr.length,
                avg:arr.length?+(arr.reduce((a,c)=>a+c.session.rating,0)/arr.length).toFixed(1):null,
                yesCount:arr.filter(c=>c.session.copAgain==="Yes").length,
                maybeCount:arr.filter(c=>c.session.copAgain==="Maybe").length,
                noCount:arr.filter(c=>c.session.copAgain==="No"||c.session.copAgain==="Never again").length,
              });
              const igS=stats(ig);const ghS=stats(gh);const ogS=stats(og);
              const allAvgs=[igS.avg,ghS.avg,ogS.avg].filter(Boolean);
              const maxAvg=allAvgs.length?Math.max(...allAvgs):null;
              const winner=(s,label)=>s.avg&&s.avg===maxAvg&&allAvgs.filter(a=>a===maxAvg).length===1?label:null;
              const renderCard=(label,s,color)=>s.count===0?null:(<div style={{flex:1,background:P.bg,borderRadius:10,padding:12,border:`0.5px solid ${P.border}`,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{fontSize:11,fontWeight:500,color:P.text,margin:0}}>{label}</p>
                  {winner(s,label)&&<span style={{fontSize:9,background:P.sage,color:P.cream,padding:"1px 6px",borderRadius:6}}>top</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:8}}>
                  <span style={{fontSize:16,fontWeight:500,color}}>{s.avg}</span>
                  <span style={{fontSize:10,color:P.textMuted}}>avg</span>
                </div>
                <div style={{display:"flex",gap:3}}>
                  <div style={{flex:1,background:"#EDF2E8",borderRadius:5,padding:"3px 0",textAlign:"center"}}>
                    <p style={{fontSize:12,fontWeight:500,color:P.sage,margin:0}}>{s.yesCount}</p>
                    <p style={{fontSize:9,color:P.textMuted,margin:"1px 0 0"}}>yes</p>
                  </div>
                  <div style={{flex:1,background:P.terracottaLight,borderRadius:5,padding:"3px 0",textAlign:"center"}}>
                    <p style={{fontSize:12,fontWeight:500,color:P.terracotta,margin:0}}>{s.maybeCount}</p>
                    <p style={{fontSize:9,color:P.textMuted,margin:"1px 0 0"}}>maybe</p>
                  </div>
                  <div style={{flex:1,background:P.surface,borderRadius:5,padding:"3px 0",textAlign:"center"}}>
                    <p style={{fontSize:12,fontWeight:500,color:P.textMuted,margin:0}}>{s.noCount}</p>
                    <p style={{fontSize:9,color:P.textMuted,margin:"1px 0 0"}}>no</p>
                  </div>
                </div>
              </div>);
              const cards=[renderCard("indoor",igS,P.sage),renderCard("greenhouse",ghS,"#8A9A3A"),renderCard("outdoor",ogS,P.onHand)].filter(Boolean);
              return(<div style={{display:"flex",gap:8}}>{cards}</div>);
            })()}
          </div>}
        </div>}
 
        {/* OUTDOOR REPORT */}
        {insightTab==="outdoor"&&<div>
          <div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>🌿 outdoor vs indoor</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 16px"}}>how setting affects your experience</p>
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              <div style={{flex:1,background:P.onHandLight,borderRadius:10,padding:14,textAlign:"center"}}>
                <p style={{fontSize:24,fontWeight:500,color:P.onHand,margin:0}}>{outdoorAvg||"—"}</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>outdoor avg</p>
                <p style={{fontSize:10,color:P.textMuted,margin:"2px 0 0"}}>{outdoorSessions.length} session{outdoorSessions.length!==1?"s":""}</p>
              </div>
              <div style={{flex:1,background:P.bg,borderRadius:10,padding:14,textAlign:"center",border:`0.5px solid ${P.border}`}}>
                <p style={{fontSize:24,fontWeight:500,color:P.textMuted,margin:0}}>{indoorAvg||"—"}</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>indoor avg</p>
                <p style={{fontSize:10,color:P.textMuted,margin:"2px 0 0"}}>{indoorSessions.length} session{indoorSessions.length!==1?"s":""}</p>
              </div>
            </div>
            {outdoorAvg>indoorAvg&&outdoorSessions.length>0&&<p style={{fontSize:12,color:P.onHand,margin:0,textAlign:"center"}}>your outdoor sessions rate {(outdoorAvg-indoorAvg).toFixed(1)} points higher on average ☀️</p>}
            {indoorAvg>outdoorAvg&&indoorSessions.length>0&&<p style={{fontSize:12,color:P.textMuted,margin:0,textAlign:"center"}}>your indoor sessions rate {(indoorAvg-outdoorAvg).toFixed(1)} points higher on average</p>}
            {outdoorAvg===indoorAvg&&outdoorSessions.length>0&&<p style={{fontSize:12,color:P.textMuted,margin:0,textAlign:"center"}}>same vibes in or out — you're consistent</p>}
          </div>
 
          {outdoorSessions.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>best outdoor strains</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>your top-rated outdoor sessions</p>
            {outdoorSessions.sort((a,b)=>b.session.rating-a.session.rating).slice(0,5).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"8px 10px",background:P.bg,borderRadius:8}}>
                <TypeBadge type={c.type}/>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:500,color:P.text,margin:0}}>{c.strain.name}</p>
                  <div style={{display:"flex",gap:3,marginTop:3}}>{c.terpenes.slice(0,3).map(t=><span key={t} style={{fontSize:9,background:P.onHand,color:P.cream,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>
                </div>
                <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=c.session.rating} color={P.onHand}/>)}</div>
              </div>
            ))}
          </div>}
 
          {outdoorTerpRanked.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>outdoor terpenes</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>terpenes you've smoked outside</p>
            {outdoorTerpRanked.slice(0,5).map(t=>(
              <div key={t.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:12,color:P.text,width:90}}>{t.name.toLowerCase()}</span>
                <div style={{flex:1,height:18,background:P.border,borderRadius:9,overflow:"hidden"}}>
                  <div style={{width:`${(t.count/Math.max(...outdoorTerpRanked.map(x=>x.count)))*100}%`,height:"100%",background:P.onHand,borderRadius:9}}/>
                </div>
                <span style={{fontSize:11,color:P.textMuted,width:20,textAlign:"right"}}>{t.count}x</span>
              </div>
            ))}
          </div>}
 
          {outdoorVibeRanked.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>outdoor vibes</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>how outside sessions make you feel</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {outdoorVibeRanked.map(([tag,count])=>(
                <span key={tag} style={{fontSize:count>2?14:count>1?12:11,background:P.onHand,color:P.cream,padding:count>2?"6px 14px":"4px 10px",borderRadius:14,fontWeight:count>2?500:400}}>{tag.toLowerCase()} ({count})</span>
              ))}
            </div>
          </div>}
 
          {outdoorExps.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
            <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>outdoor experiences</p>
            <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>notable moments outside</p>
            {outdoorExps.map((exp,i)=>(
              <div key={i} style={{background:P.onHandLight,borderRadius:8,padding:10,marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:500,color:P.text}}>{exp.strain}</span><span style={{fontSize:10,color:P.textMuted}}>{exp.date}</span></div>
                <p style={{fontSize:12,color:P.text,margin:"0 0 4px",lineHeight:1.4}}>{exp.note}</p>
                {exp.vibeTags?.length>0&&<div style={{display:"flex",gap:3}}>{exp.vibeTags.map(t=><span key={t} style={{fontSize:9,background:P.onHand,color:P.cream,padding:"1px 5px",borderRadius:6}}>{t.toLowerCase()}</span>)}</div>}
              </div>
            ))}
          </div>}
 
          {outdoorSessions.length===0&&outdoorExps.length===0&&<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}>
            <p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no outdoor sessions yet</p>
            <p style={{fontSize:12,color:P.textMuted,margin:0}}>next time you smoke outside, mark the setting as outdoor and start building your summer report ☀️</p>
          </div>}
        </div>}
 
        {/* BEDTIME REPORT */}
        {insightTab==="bedtime"&&<div>
          {(()=>{
            const WRONG_VIBES=["Energized","Restless","Laser focused","Get things done","Clean mode","Conversational"];
            const isWrongCall=entry=>
              (entry.spectrums?.sw>0)||(entry.vibeTags||[]).some(t=>WRONG_VIBES.includes(t));
 
            const bedtimeSessions=allSessionCops.filter(c=>c.session?.bedtime);
            const bedtimeMixes=allSessionCops.flatMap(c=>(c.mixes||[]).filter(m=>m.bedtime&&m.status==="reviewed").map(m=>({...m,strain:c.strain,cop:c})));
            const allBedtime=[...bedtimeSessions.map(c=>({type:"session",name:c.strain.name,rating:c.session.rating,terpenes:c.terpenes,spectrums:c.session.spectrums,vibeTags:c.session.vibeTags||[],copAgain:c.session.copAgain,intentConfirmed:strains.find(s=>s.id===c.strainId)?.intent==="asleep"})),...bedtimeMixes.map(m=>({type:"mix",name:`${m.strain.name} x ${m.withStrain}`,rating:m.rating,terpenes:m.combinedTerpenes||[],spectrums:m.spectrums,vibeTags:m.vibeTags||[],intentConfirmed:false}))];
            const wrongCalls=allBedtime.filter(isWrongCall);
            const goodCalls=allBedtime.filter(e=>!isWrongCall(e));
 
            // Terpene affinity for bedtime
            const bdTerpAgg={};allBedtime.forEach(e=>{(e.terpenes||[]).forEach(t=>{if(!bdTerpAgg[t])bdTerpAgg[t]={total:0,count:0};bdTerpAgg[t].total+=e.rating;bdTerpAgg[t].count++;});});
            const bdTerpRanked=Object.entries(bdTerpAgg).map(([name,d])=>({name,avg:+(d.total/d.count).toFixed(1),count:d.count})).sort((a,b)=>b.avg-a.avg);
 
            if(allBedtime.length===0)return(<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}><p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no bedtime sessions yet</p><p style={{fontSize:12,color:P.textMuted,margin:0}}>toggle 🌙 bedtime when logging your first session or a mix</p></div>);
            return(<>
              {/* Stats row */}
              <div style={{display:"flex",gap:12,marginBottom:16}}>
                <div style={{flex:1,background:"#2C2C4A",borderRadius:10,padding:14,textAlign:"center"}}>
                  <p style={{fontSize:22,fontWeight:500,color:"#C9B8F0",margin:0}}>{allBedtime.length}</p>
                  <p style={{fontSize:11,color:"#9B8FC0",margin:"4px 0 0"}}>bedtime blunts</p>
                </div>
                <div style={{flex:1,background:P.card,borderRadius:10,padding:14,textAlign:"center",border:`0.5px solid ${P.border}`}}>
                  <p style={{fontSize:22,fontWeight:500,color:P.sage,margin:0}}>{goodCalls.length}</p>
                  <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>good calls</p>
                </div>
                <div style={{flex:1,background:P.redLight,borderRadius:10,padding:14,textAlign:"center",border:`0.5px solid ${P.red}40`}}>
                  <p style={{fontSize:22,fontWeight:500,color:P.red,margin:0}}>{wrongCalls.length}</p>
                  <p style={{fontSize:11,color:P.textMuted,margin:"4px 0 0"}}>wrong calls</p>
                </div>
              </div>
 
              {/* Best bedtime strains */}
              {goodCalls.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
                <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>🌙 best bedtime strains</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>highest rated, no contradictory vibes</p>
                {[...goodCalls].sort((a,b)=>b.rating-a.rating).slice(0,5).map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"8px 10px",background:"#1A1A2E",borderRadius:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13,color:"#C9B8F0",fontWeight:500}}>{e.name}{e.type==="mix"&&<span style={{fontSize:10,color:"#9B8FC0",marginLeft:4}}>mix</span>}</span>
                    {e.intentConfirmed&&<span style={{fontSize:9,background:"rgba(139,127,212,0.2)",color:"#C9B8F0",padding:"1px 5px",borderRadius:5}}>🎯 intent confirmed</span>}
                  </div>
                  <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=e.rating} color="#8B7FD4"/>)}</div>
                </div>)}
              </div>}
 
              {/* Terpene affinity */}
              {bdTerpRanked.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:16}}>
                <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>bedtime terpene affinity</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>terpenes in your bedtime sessions</p>
                {bdTerpRanked.slice(0,5).map(t=><div key={t.name} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:P.text}}>{t.name.toLowerCase()}</span><span style={{fontSize:11,color:"#8B7FD4"}}>{t.avg} avg · {t.count}x</span></div>
                  <div style={{height:5,background:P.border,borderRadius:3}}><div style={{height:5,background:"#8B7FD4",borderRadius:3,width:`${(t.avg/5)*100}%`}}/></div>
                </div>)}
              </div>}
 
              {/* Wrong calls */}
              {wrongCalls.length>0&&<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`}}>
                <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>😬 wrong call list</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>marked bedtime but hit too active or wired</p>
                {wrongCalls.map((e,i)=>{
                  const reasons=[];
                  if(e.spectrums?.sw>0)reasons.push("hit active");
                  const badVibes=(e.vibeTags||[]).filter(t=>WRONG_VIBES.includes(t));
                  if(badVibes.length)reasons.push(...badVibes.map(v=>v.toLowerCase()));
                  return(<div key={i} style={{background:P.redLight,borderRadius:8,padding:10,marginBottom:6,border:`0.5px solid ${P.red}40`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:500,color:P.text}}>{e.name}{e.type==="mix"&&<span style={{fontSize:10,color:P.textMuted,marginLeft:4}}>mix</span>}</span>
                      <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=><Leaf key={n} filled={n<=e.rating} color={P.red} size={14}/>)}</div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                      {reasons.map(r=><span key={r} style={{fontSize:9,background:P.red,color:P.cream,padding:"1px 6px",borderRadius:6}}>{r}</span>)}
                    </div>
                  </div>);
                })}
              </div>}
            </>);
          })()}
        </div>}
 
        {/* INTENT REPORT */}
        {insightTab==="intent"&&<div>
          {(()=>{
            const intentCops={awake:allSessionCops.filter(c=>strains.find(s=>s.id===c.strainId)?.intent==="awake"),asleep:allSessionCops.filter(c=>strains.find(s=>s.id===c.strainId)?.intent==="asleep"),adventure:allSessionCops.filter(c=>strains.find(s=>s.id===c.strainId)?.intent==="adventure")};
            const hasAny=Object.values(intentCops).some(a=>a.length>0);
            if(!hasAny)return(<div style={{background:P.card,borderRadius:12,padding:24,border:`0.5px solid ${P.border}`,textAlign:"center"}}><p style={{fontSize:14,color:P.textMuted,margin:"0 0 4px"}}>no intent data yet</p><p style={{fontSize:12,color:P.textMuted,margin:0}}>open a strain's detail view and set its intent to start building this report</p></div>);
            const statCard=(label,emoji,cops,color)=>{
              if(cops.length===0)return null;
              const avg=+(cops.reduce((a,c)=>a+c.session.rating,0)/cops.length).toFixed(1);
              const yes=cops.filter(c=>c.session.copAgain==="Yes").length;
              const maybe=cops.filter(c=>c.session.copAgain==="Maybe").length;
              const no=cops.filter(c=>c.session.copAgain==="No"||c.session.copAgain==="Never again").length;
              const topTerps=Object.entries(cops.reduce((acc,c)=>{(c.terpenes||[]).forEach(t=>{acc[t]=(acc[t]||0)+1;});return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t);
              return(<div style={{background:P.card,borderRadius:12,padding:16,border:`0.5px solid ${P.border}`,marginBottom:14}}>
                <p style={{fontSize:14,fontWeight:500,color:P.text,margin:"0 0 4px"}}>{emoji} {label}</p>
                <p style={{fontSize:11,color:P.textMuted,margin:"0 0 12px"}}>{cops.length} cop{cops.length!==1?"s":""}</p>
                <div style={{display:"flex",gap:10,marginBottom:12}}>
                  <div style={{flex:1,background:P.bg,borderRadius:8,padding:10,textAlign:"center"}}>
                    <p style={{fontSize:20,fontWeight:500,color,margin:0}}>{avg}</p>
                    <p style={{fontSize:10,color:P.textMuted,margin:"3px 0 0"}}>avg rating</p>
                  </div>
                  <div style={{flex:1,background:P.bg,borderRadius:8,padding:10}}>
                    <div style={{display:"flex",gap:4}}>
                      <div style={{flex:1,textAlign:"center"}}><p style={{fontSize:14,fontWeight:500,color:P.sage,margin:0}}>{yes}</p><p style={{fontSize:9,color:P.textMuted,margin:"2px 0 0"}}>yes</p></div>
                      <div style={{flex:1,textAlign:"center"}}><p style={{fontSize:14,fontWeight:500,color:P.terracotta,margin:0}}>{maybe}</p><p style={{fontSize:9,color:P.textMuted,margin:"2px 0 0"}}>maybe</p></div>
                      <div style={{flex:1,textAlign:"center"}}><p style={{fontSize:14,fontWeight:500,color:P.textMuted,margin:0}}>{no}</p><p style={{fontSize:9,color:P.textMuted,margin:"2px 0 0"}}>no</p></div>
                    </div>
                  </div>
                </div>
                {topTerps.length>0&&<div><p style={{fontSize:10,color:P.textMuted,margin:"0 0 5px"}}>top terpenes</p><div style={{display:"flex",gap:4}}>{topTerps.map(t=><span key={t} style={{fontSize:10,background:P.surface,color:P.sage,padding:"2px 8px",borderRadius:8}}>{t.toLowerCase()}</span>)}</div></div>}
              </div>);
            };
            return(<>
              {statCard("asleep","🌙",intentCops.asleep,"#8B7FD4")}
              {statCard("awake","☀️",intentCops.awake,P.terracotta)}
              {statCard("adventure","🏕️",intentCops.adventure,P.onHand)}
            </>);
          })()}
        </div>}
 
      </div>}
    </div>}
  </div>
 
  {/* BOTTOM NAV */}
  <div style={{position:"fixed",bottom:0,left:0,right:0,background:P.bg,borderTop:`0.5px solid ${P.border}`,padding:"8px 0 20px",zIndex:50}}><div style={{maxWidth:480,margin:"0 auto",display:"flex",justifyContent:"space-around",alignItems:"flex-end"}}>
    <button onClick={()=>setTab("active")} style={{background:"none",border:"none",cursor:"pointer",textAlign:"center",padding:"4px 16px"}}><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 7l7-5 7 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" stroke={tab==="active"?P.sage:P.textMuted} strokeWidth="1.5" fill="none"/></svg><p style={{fontSize:10,margin:"3px 0 0",fontWeight:tab==="active"?500:400,color:tab==="active"?P.sage:P.textMuted}}>active</p></button>
    <button onClick={()=>{setSelectingReup(true);setView("reupPicker");}} style={{background:"none",border:"none",cursor:"pointer",textAlign:"center",padding:0}}><div style={{width:44,height:44,background:P.terracotta,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"-12px auto 0",boxShadow:"0 2px 8px rgba(193,127,74,0.3)"}}><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M2 9h14" stroke={P.cream} strokeWidth="2" strokeLinecap="round"/></svg></div><p style={{fontSize:10,color:P.terracotta,margin:"6px 0 0",fontWeight:500}}>log</p></button>
    <button onClick={()=>{setTab("library");setLibSubTab("strains");}} style={{background:"none",border:"none",cursor:"pointer",textAlign:"center",padding:"4px 16px"}}><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke={tab==="library"?P.text:P.textMuted} strokeWidth="1.5"/><rect x="11" y="3" width="6" height="6" rx="1" stroke={tab==="library"?P.text:P.textMuted} strokeWidth="1.5"/><rect x="3" y="11" width="6" height="6" rx="1" stroke={tab==="library"?P.text:P.textMuted} strokeWidth="1.5"/><rect x="11" y="11" width="6" height="6" rx="1" stroke={tab==="library"?P.text:P.textMuted} strokeWidth="1.5"/></svg><p style={{fontSize:10,margin:"3px 0 0",fontWeight:tab==="library"?500:400,color:tab==="library"?P.text:P.textMuted}}>library</p></button>
  </div></div>
  </div>);
}
