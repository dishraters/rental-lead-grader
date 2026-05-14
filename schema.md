# Rental Lead Grader schema

Primary table: `rental_leads`

Required/imported columns:
- property_name text
- address text
- city text
- state text
- zillow_link url/text
- rent number
- beds number
- baths number
- furnished_status enum: Furnished, Unfurnished, Unknown, Unclear
- lease_term text
- restrictions text
- hospital_demand_driver_name text
- distance_or_drive_time_to_hospital text
- airdna_projected_annual_revenue number
- contact_name text
- phone text
- email text
- website text
- verification_status enum: New, Needs Zillow Verification, Needs AirDNA, Needs Contact Info, Verified, AirDNA Verified
- lead_status enum: New, Needs Zillow Verification, Needs AirDNA, Needs Contact Info, Call First, Contacted, Rejected, Keeper
- notes text
- last_updated date/text

Calculated fields:
- airdna_monthly_revenue = airdna_projected_annual_revenue / 12
- estimated_net_profit = airdna_monthly_revenue - rent - 100
- disqualifiers text[]
- score_breakdown json
- score number 0-100
- grade enum: A, B, C, D, F
- score_explanation text
- next_action text
