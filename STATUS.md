# BigFlightDeals Status Report

**Generated:** 2026-01-22
**Status:** OPERATIONAL

## What Works

### Pipeline
- **Scout**: Fetches real flight deals from Travelpayouts API
- **Normalize**: Validates, deduplicates, enriches with affiliate URLs
- **Validate**: Schema guardrails - fails loudly on invalid data
- **Report**: Statistics output

### Frontend
- **HomePage**: Displays latest deals with origin navigation
- **OriginFlightsPage**: `/toronto-flights` - deals from specific origin
- **RouteFlightsPage**: `/toronto-to-lisbon-flights` - specific route deals
- **DealCard**: Click tracking + affiliate redirect

### Monetization
- Travelpayouts affiliate links on all deals
- Marker: `605276`
- UTM tracking: `utm_source=bigflightdeals`

### Analytics
- GA4 initialized with `VITE_GA4_MEASUREMENT_ID`
- `deal_click` event fires on every deal click
- Event includes: origin, destination, price, airline

### Automation
- GitHub Actions workflow: `.github/workflows/daily.yml`
- Runs daily at 06:00 UTC
- Auto-commits updated deals.json

## Current Stats

| Metric | Value |
|--------|-------|
| Total Deals | 90 |
| Unique Routes | 30 |
| Origins | YYZ, YUL, YVR |
| Price Range | $138 - $816 CAD |
| Last Updated | 2026-01-20 |

## How to Run

### One Command (Full Pipeline)
```bash
npm run bfd:run
```
This runs: scout -> normalize -> validate -> build -> report

### Individual Steps
```bash
npm run scout      # Fetch deals from API
npm run normalize  # Process raw deals
npm run validate   # Check schema validity
npm run build      # Build frontend
npm run report     # Show statistics
npm run preview    # Preview production build
```

### Environment Variables Required
```
TRAVELPAYOUTS_TOKEN=<your-token>
TRAVELPAYOUTS_MARKER=605276
VITE_GA4_MEASUREMENT_ID=G-W88RLHZTZS
```

## Verification Checklist

- [x] Pipeline runs without errors
- [x] deals.json contains valid data
- [x] All deals have affiliate links with marker
- [x] Frontend builds successfully
- [x] Slug routing works (origin and route pages)
- [x] GA4 tracking initialized
- [x] deal_click event configured in DealCard
- [x] GitHub Actions workflow configured
- [x] Copilot agent created

## What Needs Human Approval

1. **GitHub Secrets**: Ensure these are set in repo settings:
   - `TRAVELPAYOUTS_TOKEN`
   - `TRAVELPAYOUTS_MARKER`
   - `VITE_GA4_MEASUREMENT_ID`

2. **Deploy Target**: Currently builds to `/dist`. Choose deployment:
   - Vercel (connect repo for auto-deploy)
   - Netlify (connect repo for auto-deploy)
   - GitHub Pages (add deploy step to workflow)

3. **GA4 Verification**: After deploy, verify in GA4 Realtime:
   - Open site
   - Click a deal
   - Check GA4 > Realtime > Events for `deal_click`

4. **Affiliate Verification**: After deploy, verify in Travelpayouts:
   - Click a deal
   - Complete a test booking (if possible)
   - Check Travelpayouts dashboard for click tracking

## Architecture

```
User Visit
    │
    ▼
┌─────────────────┐
│  Static React   │  (Vite build → /dist)
│  Frontend       │
└─────────────────┘
    │
    │ imports
    ▼
┌─────────────────┐
│  deals.json     │  (Single source of truth)
└─────────────────┘
    │
    │ click
    ▼
┌─────────────────┐     ┌─────────────────┐
│  GA4 Event      │     │  Travelpayouts  │
│  (deal_click)   │     │  Affiliate Link │
└─────────────────┘     └─────────────────┘
```

## 30-Day Unattended Operation

**Can this run for 30 days without intervention?** YES, assuming:

1. GitHub Actions is enabled
2. Secrets are configured
3. Travelpayouts API remains stable
4. No breaking changes to dependencies

**Daily automated flow:**
1. 06:00 UTC: GitHub Action triggers
2. Scout fetches fresh deals from API
3. Normalize validates and enriches
4. If valid, commits new deals.json
5. If connected to Vercel/Netlify, auto-deploys

**Failure safeguards:**
- Pipeline refuses to overwrite deals.json if 0 deals returned
- Validation fails loudly on schema violations
- Build fails if TypeScript/React errors exist
- All failures visible in GitHub Actions logs

## Files Modified/Created

| File | Status |
|------|--------|
| `package.json` | Updated - added `bfd:run` and `validate` commands |
| `scripts/validate.js` | Created - schema validation with guardrails |
| `scripts/normalize.js` | Updated - adds origin_slug, route_slug, travel_dates |
| `src/data/deals.json` | Updated - added slug fields to all deals |
| `.github/agents/bfd-operator.agent.md` | Created - Copilot enforcement agent |
| `STATUS.md` | Created - this file |

## Contact

For issues, check GitHub Actions logs first, then:
- Travelpayouts API issues: Check their status page
- GA4 issues: Check GA4 Debug View
- Build issues: Run `npm run build` locally
