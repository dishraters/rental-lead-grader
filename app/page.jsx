'use client';
import React, { useEffect, useMemo, useState } from 'react';
import './globals.css';

const STATUS = ['New','Needs Zillow Verification','Needs AirDNA','Needs Contact Info','Call First','Contacted','Rejected','Keeper'];
const VERIFICATION = ['New','Needs Zillow Verification','Needs AirDNA','Needs Contact Info','Verified','AirDNA Verified'];
const FIELD_ALIASES = {
  propertyName: ['Property name','property_name','Property Name','name'],
  address: ['Address','address'], city: ['City','city'], state: ['State','state'],
  zillowLink: ['Zillow link','Zillow Link','zillow_link','Zillow URL'], rent: ['Rent','Monthly Rent','rent'],
  beds: ['Beds','beds'], baths: ['Baths','baths'], furnishedStatus: ['Furnished status','Furnished Status','furnished_status'],
  leaseTerm: ['Lease term','Lease Term','lease_term'], restrictions: ['Restrictions','restrictions'],
  hospitalName: ['Hospital / demand driver name','Hospital','Demand driver','hospital_demand_driver_name'],
  hospitalDistance: ['Distance or drive time to hospital','Hospital Distance','Drive time','distance_or_drive_time_to_hospital'],
  airdnaAnnual: ['AirDNA projected annual revenue','AirDNA Projected Annual Revenue','airdna_projected_annual_revenue'],
  airdnaMonthly: ['AirDNA Monthly Revenue','AirDNA monthly revenue','Monthly Revenue'],
  contactName: ['Contact name','Contact Name','contact_name'], phone: ['Phone','phone'], email: ['Email','email'], website: ['Website','website'],
  verificationStatus: ['Verification status','Verification Status','verification_status'], leadStatus: ['Lead status','Lead Status','lead_status'],
  notes: ['Notes','notes'], lastUpdated: ['Last updated','Last Updated','last_updated']
};
const SAMPLE = [
  ['Westhampton Court','2125 Defoors Ferry Rd NW','Atlanta','GA','https://www.zillow.com/',1050,1,1,'Unknown','6+ months','None','Piedmont Atlanta Hospital','12 min',26400,'Leasing Office','(404) 555-0101','leasing@example.com','https://example.com','AirDNA Verified','New','Known early keeper economics; furnished still needs call verification'],
  ['Peachtree Furnished Flats','1000 Peachtree St NE','Atlanta','GA','https://www.zillow.com/',1180,1,1,'Furnished','6 months','None','Emory University Hospital Midtown','8 min',30400,'Maria Leasing','(404) 555-0110','maria@example.com','https://example.com','Verified','New','Strong call-first sample'],
  ['Riverbend Senior Villas','44 Riverbend Dr','Birmingham','AL','https://www.zillow.com/',995,1,1,'Unknown','12 months','55+ senior only','UAB Hospital','10 min',27800,'Office','(205) 555-0102','office@example.com','https://example.com','Needs Zillow Verification','New','Rejected because senior-only'],
  ['Columbia Medical Lofts','901 Assembly St','Columbia','SC','https://www.zillow.com/',1325,1,1,'Unknown','Unknown','None','Prisma Health Richland','14 min',25200,'','(803) 555-0112','','https://example.com','Needs Contact Info','New','Good economics but missing furnished/lease/contact detail'],
  ['Baton Rouge Garden','77 Garden Ln','Baton Rouge','LA','https://www.zillow.com/',1450,1,1,'Furnished','6 months','None','Baton Rouge General','11 min',33000,'Leasing','(225) 555-0199','','https://example.com','Verified','New','Rent exceeds cap'],
  ['Studio Near Hospital','12 Market St','Atlanta','GA','https://www.zillow.com/',900,0,1,'Furnished','6 months','None','Grady Memorial','6 min',26000,'Office','(404) 555-0195','','','Verified','New','Studio disqualifier'],
  ['Oakwood Maybe','305 Oakwood Ave','Montgomery','AL','https://www.zillow.com/',1100,1,1,'Unclear','Unknown','None','Baptist Medical Center South','18 min',25000,'','','','','Needs AirDNA','New','Distance and AirDNA verification concern'],
  ['Midtown Nurse Landing','80 12th St NE','Atlanta','GA','https://www.zillow.com/',1240,1,1,'Furnished','Flexible 6-12 months','None','Northside Midtown','9 min',31800,'Nina','(404) 555-0122','nina@example.com','','Verified','New','Excellent operator lead'],
  ['Cahaba Commons','201 Cahaba Rd','Birmingham','AL','https://www.zillow.com/',1195,1,1,'Unknown','12 months','None','Brookwood Baptist Medical Center','13 min',27200,'','','','','Needs Contact Info','New','Call to confirm furnished package'],
  ['Prisma Southline','620 Harden St','Columbia','SC','https://www.zillow.com/',990,1,1,'Unfurnished','12 months','None','Prisma Health Baptist','7 min',21000,'Leasing','(803) 555-0144','','','Needs AirDNA','New','Economics weak but possible with better AirDNA'],
  ['Student Lofts Downtown','15 College Ave','Athens','GA','https://www.zillow.com/',1000,1,1,'Furnished','Academic year','student-only','Piedmont Athens Regional','6 min',28600,'Office','(706) 555-0199','','','Verified','New','Student-only restriction'],
  ['Gulf Coast Corporate Flat','19 Mobile St','Mobile','AL','https://www.zillow.com/',1300,1,1,'Furnished','6 months','None','USA Health University Hospital','10 min',30200,'Tara','(251) 555-0188','tara@example.com','','Verified','New','High quality B/A border'],
  ['Northside Value Apt','410 Glenridge Dr','Atlanta','GA','https://www.zillow.com/',875,1,1,'Unknown','Unknown','None','Northside Hospital Atlanta','16 min',24400,'','','','','Needs Zillow Verification','New','Cheap rent, but demand/lease unverified'],
  ['Income Restricted Tower','2 Civic Center Pl','Birmingham','AL','https://www.zillow.com/',800,1,1,'Unknown','12 months','income-restricted','UAB Hospital','5 min',25000,'Office','(205) 555-0177','','','Needs Zillow Verification','New','Fails restriction'],
  ['Lakeside Executive 1BR','88 Lake Dr','Baton Rouge','LA','https://www.zillow.com/',1395,1,1,'Furnished','30+ day corporate allowed','None','Our Lady of the Lake Regional','9 min',33600,'Dana','(225) 555-0133','dana@example.com','https://example.com','AirDNA Verified','New','Great top-end lead']
].map((r,i)=>rowFromArray(r,i));
function rowFromArray(r,i){return {id: crypto.randomUUID?.() || String(Date.now()+i), propertyName:r[0],address:r[1],city:r[2],state:r[3],zillowLink:r[4],rent:r[5],beds:r[6],baths:r[7],furnishedStatus:r[8],leaseTerm:r[9],restrictions:r[10],hospitalName:r[11],hospitalDistance:r[12],airdnaAnnual:r[13],contactName:r[14],phone:r[15],email:r[16],website:r[17],verificationStatus:r[18],leadStatus:r[19],notes:r[20],lastUpdated:'2026-05-14'}}
function num(v){ const n = Number(String(v ?? '').replace(/[$,]/g,'')); return Number.isFinite(n) ? n : 0; }
function minutes(v){ const m = String(v||'').match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : null; }
function hasAny(text, words){ const t = String(text||'').toLowerCase(); return words.some(w=>t.includes(w)); }
export function scoreLead(lead){
  const rent = num(lead.rent), beds = num(lead.beds), baths = num(lead.baths), annual = num(lead.airdnaAnnual), importedMonthly = num(lead.airdnaMonthly);
  const monthlyRevenue = importedMonthly || (annual ? annual / 12 : 0);
  const netProfit = monthlyRevenue - rent - 100;
  const mins = minutes(lead.hospitalDistance);
  const disqualifiers = [];
  const uncertain = [];
  if (beds !== 1 || baths !== 1) disqualifiers.push('Not a 1 bed / 1 bath property');
  if (rent > 1400) disqualifiers.push('Rent is over $1,400/month');
  if (hasAny(lead.restrictions, ['55+','senior','income-restricted','income restricted','student-only','student only'])) disqualifiers.push('Restricted property: 55+, senior, income-restricted, or student-only');
  if (hasAny(lead.leaseTerm, ['no sublet','no corporate','not allowed','incompatible'])) disqualifiers.push('Lease term is incompatible with arbitrage');
  if (mins !== null && mins > 15) disqualifiers.push('Too far from hospital / demand driver');
  if (!monthlyRevenue || hasAny(lead.verificationStatus, ['needs airdna']) || hasAny(lead.notes, ['unreliable airdna'])) uncertain.push('Missing or unverified AirDNA estimate');
  if (monthlyRevenue && netProfit < 1000) disqualifiers.push('Estimated net profit is below $1,000/month');
  if (!lead.hospitalName || !lead.hospitalDistance) uncertain.push('Hospital / demand proximity needs verification');
  if (hasAny(lead.furnishedStatus, ['unknown','unclear']) || !lead.furnishedStatus) uncertain.push('Furnished status needs verification');
  if (hasAny(lead.leaseTerm, ['unknown']) || !lead.leaseTerm) uncertain.push('Lease term needs verification');
  if (!lead.phone && !lead.email && !lead.website) uncertain.push('Missing contact path');

  const breakdown = {
    profitability: Math.max(0, Math.min(40, monthlyRevenue ? (netProfit >= 1400 ? 40 : netProfit >= 1200 ? 36 : netProfit >= 1000 ? 32 : netProfit >= 700 ? 20 : 8) : 0)),
    rentAffordability: rent && rent <= 1100 ? 15 : rent <= 1250 ? 12 : rent <= 1400 ? 8 : 0,
    demandProximity: mins === null ? 6 : mins <= 10 ? 15 : mins <= 15 ? 11 : mins <= 20 ? 5 : 0,
    zillowVerification: hasAny(lead.verificationStatus, ['verified']) ? 10 : hasAny(lead.verificationStatus, ['needs zillow']) ? 2 : 5,
    furnishedLeaseFit: hasAny(lead.furnishedStatus, ['furnished']) && !hasAny(lead.leaseTerm, ['unknown']) ? 10 : hasAny(lead.furnishedStatus, ['unknown','unclear']) ? 4 : 2,
    contactability: lead.phone && (lead.email || lead.website) ? 10 : (lead.phone || lead.email || lead.website) ? 6 : 0
  };
  const score = Object.values(breakdown).reduce((a,b)=>a+b,0);
  let grade = 'D';
  if (disqualifiers.length) grade = 'F';
  else if (uncertain.length === 1 && netProfit >= 900) grade = 'C';
  else if (uncertain.length > 1) grade = netProfit >= 1000 ? 'C' : 'D';
  else if (netProfit >= 1200) grade = 'A';
  else if (netProfit >= 1000) grade = 'B';
  else grade = 'D';
  let nextAction = 'Review lead';
  if (grade === 'F') nextAction = 'Reject — ' + disqualifiers[0];
  else if (!monthlyRevenue || hasAny(lead.verificationStatus, ['needs airdna'])) nextAction = 'Run/verify AirDNA with exact address and 1/1 inputs';
  else if (hasAny(lead.verificationStatus, ['needs zillow']) || uncertain.some(x=>x.includes('Furnished') || x.includes('Lease'))) nextAction = 'Verify Zillow actual unit rent, furnished option, and lease terms';
  else if (!lead.phone && !lead.email && !lead.website) nextAction = 'Find leasing contact info';
  else if (grade === 'A' || grade === 'B') nextAction = 'Call first — verify corporate/furnished availability and all-in monthly cost';
  else nextAction = 'Verify missing fields before calling';
  return {monthlyRevenue, netProfit, disqualifiers, uncertain, breakdown, score, grade, nextAction, explanation: `${grade}: $${Math.round(netProfit).toLocaleString()}/mo estimated net after rent + $100 buffer. ${disqualifiers.length ? 'Rejected: '+disqualifiers.join('; ') : uncertain.length ? 'Needs verification: '+uncertain.join('; ') : 'Passes hard filters.'}`};
}
function parseCSV(text){
  const rows=[]; let row=[], cur='', q=false;
  for(let i=0;i<text.length;i++){ const c=text[i], n=text[i+1]; if(c==='"'&&q&&n==='"'){cur+='"';i++;} else if(c==='"'){q=!q;} else if(c===','&&!q){row.push(cur);cur='';} else if((c==='\n'||c==='\r')&&!q){ if(c==='\r'&&n==='\n') i++; row.push(cur); if(row.some(x=>x.trim())) rows.push(row); row=[]; cur=''; } else cur+=c; }
  row.push(cur); if(row.some(x=>x.trim())) rows.push(row);
  const headers = rows.shift()?.map(h=>h.trim()) || [];
  return rows.map((r,i)=>{ const raw={}; headers.forEach((h,j)=>raw[h]=r[j]?.trim() ?? ''); const out={id: crypto.randomUUID?.() || String(Date.now()+i)}; for(const [key,aliases] of Object.entries(FIELD_ALIASES)){ const h=aliases.find(a=>a in raw); out[key]=h?raw[h]:''; } return out; });
}
function toCSV(leads){ const cols = ['Property name','Address','City','State','Zillow link','Rent','Beds','Baths','Furnished status','Lease term','Restrictions','Hospital / demand driver name','Distance or drive time to hospital','AirDNA projected annual revenue','Contact name','Phone','Email','Website','Verification status','Lead status','Notes','Last updated']; const keys=['propertyName','address','city','state','zillowLink','rent','beds','baths','furnishedStatus','leaseTerm','restrictions','hospitalName','hospitalDistance','airdnaAnnual','contactName','phone','email','website','verificationStatus','leadStatus','notes','lastUpdated']; return [cols.join(','),...leads.map(l=>keys.map(k=>`"${String(l[k]??'').replaceAll('"','""')}"`).join(','))].join('\n'); }
export default function App(){
  const [leads,setLeads]=useState(()=>{try{return JSON.parse(localStorage.getItem('rlg-leads'))||SAMPLE}catch{return SAMPLE}});
  const [liveMeta,setLiveMeta]=useState(null);
  useEffect(()=>{ if(!localStorage.getItem('rlg-leads')) loadLiveData(false); }, []);
  async function loadLiveData(force=true){
    const res = await fetch('/current-leads.json?ts=' + Date.now());
    if(!res.ok) throw new Error('Live lead file unavailable');
    const data = await res.json();
    if(data.leads?.length){ save(data.leads); setLiveMeta(data); }
    else if(force) alert('No live leads found');
  }
  const [view,setView]=useState('All Leads'), [query,setQuery]=useState(''), [grade,setGrade]=useState(''), [status,setStatus]=useState(''), [city,setCity]=useState(''), [selected,setSelected]=useState(null);
  function save(next){ setLeads(next); localStorage.setItem('rlg-leads', JSON.stringify(next)); }
  const scored = useMemo(()=>leads.map(l=>({...l,...scoreLead(l)})).sort((a,b)=>b.score-a.score),[leads]);
  const filtered = scored.filter(l=>{
    if(view==='Call First' && !( ['A','B'].includes(l.grade) && !l.disqualifiers.length && (l.phone||l.email||l.website))) return false;
    if(view==='Rejected' && l.grade!=='F' && l.leadStatus!=='Rejected') return false;
    if(view==='Needs Verification' && !(l.uncertain.length || String(l.verificationStatus).includes('Needs'))) return false;
    if(view==='Keepers' && !(l.grade==='A' || l.leadStatus==='Keeper')) return false;
    if(grade && l.grade!==grade) return false; if(status && l.leadStatus!==status) return false; if(city && l.city!==city) return false;
    if(query && !JSON.stringify(l).toLowerCase().includes(query.toLowerCase())) return false; return true;
  });
  const stats = {total:scored.length, call:scored.filter(l=>['A','B'].includes(l.grade)&&!l.disqualifiers.length&&(l.phone||l.email||l.website)).length, rejected:scored.filter(l=>l.grade==='F'||l.leadStatus==='Rejected').length, avg:Math.round(scored.reduce((a,l)=>a+l.score,0)/(scored.length||1))};
  function updateLead(id, patch){ save(leads.map(l=>l.id===id?{...l,...patch,lastUpdated:new Date().toISOString().slice(0,10)}:l)); setSelected(s=>s&&s.id===id?{...s,...patch}:s); }
  return <div><header><div><h1>Rental Lead Grader</h1><p>Import Zillow + AirDNA leads → auto-score → call the money leads first.</p></div><div className="actions"><button onClick={()=>loadLiveData()}>Refresh live Bronson data</button><button onClick={()=>save(SAMPLE)}>Load sample leads</button><label className="btn">Import CSV<input type="file" accept=".csv" hidden onChange={async e=>{const f=e.target.files[0]; if(f) save(parseCSV(await f.text()))}}/></label><a className="btn" href={'data:text/csv;charset=utf-8,'+encodeURIComponent(toCSV(leads))} download="rental-leads-export.csv">Export CSV</a></div></header>
  {liveMeta && <div className="livebar">Live Bronson sheet: {liveMeta.count} leads, last synced {new Date(liveMeta.fetchedAt).toLocaleString()}</div>}
  <section className="stats"><Card label="Total leads" value={stats.total}/><Card label="Call first" value={stats.call}/><Card label="Rejected" value={stats.rejected}/><Card label="Avg score" value={stats.avg}/></section>
  <nav>{['All Leads','Call First','Needs Verification','Rejected','Keepers'].map(v=><button className={view===v?'active':''} onClick={()=>setView(v)}>{v}</button>)}</nav>
  <section className="filters"><input placeholder="Search property, city, notes..." value={query} onChange={e=>setQuery(e.target.value)}/><select value={grade} onChange={e=>setGrade(e.target.value)}><option value="">All grades</option>{['A','B','C','D','F'].map(g=><option>{g}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{STATUS.map(s=><option>{s}</option>)}</select><select value={city} onChange={e=>setCity(e.target.value)}><option value="">All cities</option>{[...new Set(scored.map(l=>l.city).filter(Boolean))].sort().map(c=><option>{c}</option>)}</select></section>
  <main><table><thead><tr><th>Grade</th><th>Property</th><th>Market</th><th>Rent</th><th>Net</th><th>Score</th><th>Status</th><th>Next action</th></tr></thead><tbody>{filtered.map(l=><tr onClick={()=>setSelected(l)}><td><span className={'grade g'+l.grade}>{l.grade}</span></td><td><b>{l.propertyName}</b><small>{l.address}</small></td><td>{l.city}, {l.state}<small>{l.hospitalDistance} to {l.hospitalName}</small></td><td>${num(l.rent).toLocaleString()}</td><td className={l.netProfit>=1000?'money':'bad'}>${Math.round(l.netProfit).toLocaleString()}</td><td>{l.score}/100</td><td>{l.leadStatus||'New'}</td><td>{l.nextAction}</td></tr>)}</tbody></table></main>
  {selected && <Detail lead={scored.find(l=>l.id===selected.id)||selected} onClose={()=>setSelected(null)} onUpdate={updateLead}/>}<footer>Scoring file: <code>app/page.jsx</code>. Data stays in browser localStorage for this MVP.</footer></div>
}
function Card({label,value}){return <div className="card"><span>{label}</span><strong>{value}</strong></div>}
function Detail({lead,onClose,onUpdate}){ const [draft,setDraft]=useState(lead); const s=scoreLead(draft); const set=(k,v)=>setDraft(d=>({...d,[k]:v})); const save=()=>onUpdate(lead.id,draft); return <div className="modal"><div className="panel"><button className="close" onClick={onClose}>×</button><h2><span className={'grade g'+s.grade}>{s.grade}</span> {draft.propertyName}</h2><p>{draft.address}, {draft.city}, {draft.state}</p><div className="split"><section><h3>Score breakdown</h3>{Object.entries(s.breakdown).map(([k,v])=><div className="bar"><span>{k}</span><meter min="0" max={k==='profitability'?40:15} value={v}></meter><b>{v}</b></div>)}<p className="explain">{s.explanation}</p><h3>Disqualifiers</h3><ul>{s.disqualifiers.length?s.disqualifiers.map(d=><li>{d}</li>):<li>None</li>}</ul><h3>Next action</h3><p className="next">{s.nextAction}</p></section><section className="form"><h3>Edit lead</h3>{['propertyName','rent','beds','baths','furnishedStatus','leaseTerm','restrictions','hospitalName','hospitalDistance','airdnaAnnual','contactName','phone','email','website'].map(k=><label>{k}<input value={draft[k]??''} onChange={e=>set(k,e.target.value)}/></label>)}<label>Verification status<select value={draft.verificationStatus||'New'} onChange={e=>set('verificationStatus',e.target.value)}>{VERIFICATION.map(x=><option>{x}</option>)}</select></label><label>Lead status<select value={draft.leadStatus||'New'} onChange={e=>set('leadStatus',e.target.value)}>{STATUS.map(x=><option>{x}</option>)}</select></label><label>Caller notes<textarea value={draft.notes||''} onChange={e=>set('notes',e.target.value)} /></label><button className="primary" onClick={save}>Save edits</button></section></div></div></div> }

