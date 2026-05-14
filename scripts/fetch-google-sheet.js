const fs = require('fs');
const path = require('path');

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1QVxoUHtG-NmMX0xWxjqhsURvKxUO_znDtPYgJzBhoRE';
const GID = process.env.GOOGLE_SHEET_GID || '';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv${GID ? `&gid=${GID}` : ''}`;

function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i=0; i<text.length; i++) {
    const c=text[i], n=text[i+1];
    if (c === '"' && q && n === '"') { cur += '"'; i++; }
    else if (c === '"') q = !q;
    else if (c === ',' && !q) { row.push(cur); cur = ''; }
    else if ((c === '\n' || c === '\r') && !q) { if (c === '\r' && n === '\n') i++; row.push(cur); if(row.some(x=>String(x).trim())) rows.push(row); row=[]; cur=''; }
    else cur += c;
  }
  row.push(cur); if(row.some(x=>String(x).trim())) rows.push(row);
  const headers = rows.shift()?.map(h=>h.trim()) || [];
  return rows.map(r => Object.fromEntries(headers.map((h,i)=>[h, (r[i] || '').trim()])));
}
function first(raw, names) { for (const n of names) if (raw[n] !== undefined && raw[n] !== '') return raw[n]; return ''; }
function num(v) { const n = Number(String(v ?? '').replace(/[$,]/g,'')); return Number.isFinite(n) ? n : 0; }
function normalize(raw, i) {
  const monthly = num(first(raw, ['AirDNA Monthly Revenue','Monthly Revenue','AirDNA monthly revenue']));
  const annual = num(first(raw, ['AirDNA projected annual revenue','AirDNA Projected Annual Revenue','AirDNA Annual Revenue'])) || (monthly ? monthly * 12 : 0);
  const address = first(raw, ['Address','address']);
  const propertyName = first(raw, ['Property name','Property Name','Name','Apartment Name','Property']) || address.split(',')[0] || `Lead ${i+1}`;
  return {
    id: `${address || propertyName}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
    propertyName,
    address,
    city: first(raw, ['City','city']),
    state: first(raw, ['State','state']),
    zillowLink: first(raw, ['Zillow URL','Zillow link','Zillow Link','Zillow']),
    rent: first(raw, ['Zillow Rent','Rent','Monthly Rent']),
    beds: first(raw, ['Beds','Bed','Bedrooms']) || '1',
    baths: first(raw, ['Baths','Bath','Bathrooms']) || '1',
    furnishedStatus: first(raw, ['Furnished Evidence','Furnished status','Furnished Status']) || 'Unknown',
    leaseTerm: first(raw, ['Lease Term Evidence','Lease term','Lease Term']) || 'Unknown',
    restrictions: first(raw, ['55+?','Restrictions','Restriction']) || 'None',
    hospitalName: first(raw, ['Hospital / demand driver name','Hospital','Demand Driver','Nearest Hospital']) || first(raw, ['Hospital <=15 min?']),
    hospitalDistance: first(raw, ['Distance or drive time to hospital','Drive Time','Hospital Distance']) || first(raw, ['Hospital <=15 min?']),
    airdnaAnnual: annual ? Math.round(annual) : '',
    contactName: first(raw, ['Contact name','Contact / PM','Contact','PM']),
    phone: first(raw, ['Phone','phone']),
    email: first(raw, ['Email','email']),
    website: first(raw, ['Website','website']),
    verificationStatus: first(raw, ['Verification status','Verification Status']) || (first(raw, ['Last Checked']) ? 'Verified' : 'New'),
    leadStatus: first(raw, ['Lead status','Status']) || 'New',
    notes: [first(raw, ['Evidence / Notes','Notes']), first(raw, ['Investor View']), first(raw, ['Next Action'])].filter(Boolean).join(' | '),
    lastUpdated: first(raw, ['Last updated','Last Checked']) || new Date().toISOString().slice(0,10)
  };
}
(async () => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Sheet fetch failed ${res.status}: ${await res.text().then(t=>t.slice(0,300))}`);
  const csv = await res.text();
  const rows = parseCSV(csv).map(normalize).filter(r => r.address || r.zillowLink || r.propertyName);
  const output = { source: 'Bronson Zillow/AirDNA Google Sheet', sheetId: SHEET_ID, fetchedAt: new Date().toISOString(), count: rows.length, leads: rows };
  fs.writeFileSync(path.join(process.cwd(), 'public/current-leads.json'), JSON.stringify(output, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'data/latest-bronson-sheet-export.csv'), csv);
  console.log(`Fetched ${rows.length} leads from Google Sheet into public/current-leads.json`);
})();
