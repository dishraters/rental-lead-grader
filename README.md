# Rental Lead Grader

A fast MVP web app for Bronson-style Zillow + AirDNA rental arbitrage lead review.

The workflow is simple:

1. Import apartment leads from CSV / Google Sheet export.
2. Automatically calculate AirDNA monthly revenue, estimated net profit, score, grade, disqualifiers, and next action.
3. Sort and filter leads so a VA/caller can call the best properties first.
4. Track status, notes, contact info, and verification state.

## Live demo

Vercel URL: https://rental-lead-grader.vercel.app

## Local setup

```bash
cd rental-lead-grader
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://127.0.0.1:5173`.

## Files

- App/scoring logic: `app/page.jsx`
- Styles: `app/globals.css`
- Import template: `data/import-template.csv`
- Sample dataset: `data/sample-leads.csv`
- Schema: `schema.md`
- Env example: `.env.example`

## CSV import

Export a Google Sheet tab as CSV, then click **Import CSV**.

Required/import-supported columns:

- Property name
- Address
- City
- State
- Zillow link
- Rent
- Beds
- Baths
- Furnished status
- Lease term
- Restrictions
- Hospital / demand driver name
- Distance or drive time to hospital
- AirDNA projected annual revenue
- Contact name
- Phone
- Email
- Website
- Verification status
- Lead status
- Notes
- Last updated

The import is browser-only for this MVP. Data is stored in `localStorage`, not a backend database.

## Scoring logic

Implemented in `app/page.jsx` in `scoreLead()`.

### Keeper formula

```text
AirDNA Monthly Revenue = AirDNA Projected Annual Revenue / 12
Estimated Net Profit = AirDNA Monthly Revenue - Monthly Rent - 100
Keeper if Estimated Net Profit >= 1000
```

### Hard disqualifiers

A lead receives grade `F` if any of these are true:

- Not 1 bed / 1 bath
- Rent is over $1,400/month
- 55+, senior-only, income-restricted, or student-only property
- Lease term explicitly incompatible with arbitrage
- More than 15 minutes from hospital / demand driver when drive time is provided
- Estimated net profit below $1,000/month when AirDNA revenue exists

### Grade rules

- `A` = passes hard filters, no major missing fields, estimated net profit >= $1,200/month
- `B` = passes hard filters, no major missing fields, estimated net profit >= $1,000/month
- `C` = close but has one or more major missing/uncertain fields that need verification
- `D` = weak economics, multiple missing fields, or unlikely to pass
- `F` = fails a hard disqualifier

### Point model

- Profitability: 40 points
- Rent affordability: 15 points
- Demand proximity / hospital access: 15 points
- Zillow verification quality: 10 points
- Furnished / lease fit: 10 points
- Contactability: 10 points

## Views

- **All Leads**: full imported dataset, sorted by score
- **Call First**: A/B leads with contact path and no disqualifiers
- **Needs Verification**: leads missing Zillow, AirDNA, furnished, lease, hospital, or contact confidence
- **Rejected**: F leads and manually rejected leads, with reasons
- **Keepers**: A-grade or manually marked keeper leads

## Editing

Click any row to open the property detail/edit panel. A caller can update:

- Status
- Verification status
- Contact name
- Phone
- Email
- Website
- Notes
- Core scoring fields if new information is discovered on a call

Edits recalculate score and grade immediately and are saved to browser localStorage.

## Deployment notes

This is a Next.js app and deploys cleanly to Vercel with:

- Framework preset: Next.js
- Build command: `npm run build`
- Output handled automatically by Vercel

No secrets or environment variables are required for the current MVP.

## Proof screenshots

- Dashboard: `proof-dashboard.png`
- Property detail/edit: `proof-detail.png`

## Limitations

- No login/auth yet
- No shared backend/database yet
- Edits are local to the browser
- CSV import replaces current browser data instead of merging/deduping
- Google Sheets sync is manual export/import only
- Hospital drive time is parsed from text and not geocoded
- AirDNA data is imported manually; no AirDNA API integration

## Next improvements

1. Add Supabase so Bronson/VA/operator data is shared across devices.
2. Add Google Sheets sync by sheet URL/tab.
3. Add dedupe by address + property name.
4. Add call outcome fields and callback reminders.
5. Add map/geocoding drive-time verification to hospitals.
6. Add AirDNA verification checklist and screenshot/proof upload.
7. Add team-ready views: caller queue, manager review, verified keepers.
