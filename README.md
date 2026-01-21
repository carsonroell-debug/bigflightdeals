# BigFlightDeals (BFD)

A flight deals aggregator that fetches real prices from Travelpayouts and displays them with affiliate monetization.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your tokens
cp .env.example .env
# Edit .env and add TRAVELPAYOUTS_TOKEN

# Run the deals pipeline
npm run pipeline

# Build and preview
npm run build
npm run preview
```

## Environment Variables

### Required for Pipeline

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `TRAVELPAYOUTS_TOKEN` | API token for fetching deals | [Travelpayouts API](https://www.travelpayouts.com/developers/api) |
| `TRAVELPAYOUTS_MARKER` | Affiliate marker for links | [Travelpayouts Programs](https://www.travelpayouts.com/programs) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `BFD_ORIGINS` | `YYZ,YUL,YVR` | Comma-separated IATA codes to fetch deals from |
| `BFD_CURRENCY` | `CAD` | Currency for prices |
| `BFD_LIMIT` | `200` | Max deals to keep |
| `VITE_GA4_MEASUREMENT_ID` | - | Google Analytics 4 ID for tracking |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run pipeline` | Fetch and normalize deals (scout + normalize) |
| `npm run scout` | Fetch raw deals from Travelpayouts API |
| `npm run normalize` | Validate and enrich raw deals |
| `npm run report` | Show stats about current deals |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run dev` | Start development server |

## Pipeline Architecture

```
┌─────────┐     ┌───────────┐     ┌─────────────┐
│  Scout  │ ──▶ │ Normalize │ ──▶ │ deals.json  │
└─────────┘     └───────────┘     └─────────────┘
     │                                    │
     ▼                                    ▼
raw_deals.json                      Frontend reads
```

### Scout (`scripts/scout.js`)
- Fetches deals from Travelpayouts API for configured origins
- Outputs raw data to `src/data/raw_deals.json`

### Normalize (`scripts/normalize.js`)
- Validates required fields
- Deduplicates by origin+destination+price+date
- Enriches with city names, affiliate URLs, timestamps
- Outputs to `src/data/deals.json`

### Report (`scripts/report.js`)
- Shows deal counts per origin
- Lists top 10 cheapest deals
- Shows price ranges

## Verification

After running the pipeline:

1. **Check the data**: `npm run report`
2. **Test the frontend**: `npm run build && npm run preview`
3. **Verify pages load**:
   - Home: http://localhost:4173/
   - Origin: http://localhost:4173/yyz-flights
   - Route: http://localhost:4173/toronto-to-lisbon-flights
4. **Verify GA4**: Click a deal, check Network tab for `google-analytics.com/g/collect`

## File Structure

```
bigflightdeals/
├── src/
│   ├── data/
│   │   ├── deals.json        # Canonical deals (frontend reads this)
│   │   └── raw_deals.json    # Raw API response (intermediate)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── OriginFlightsPage.tsx
│   │   └── RouteFlightsPage.tsx
│   ├── components/
│   │   └── DealCard.tsx      # Fires GA4 deal_click on click
│   └── lib/
│       └── affiliate.ts      # Affiliate URL builder
├── scripts/
│   ├── config.js             # Env vars and constants
│   ├── scout.js              # Fetch deals from API
│   ├── normalize.js          # Validate/dedupe/enrich
│   ├── run_pipeline.js       # Run scout + normalize
│   └── report.js             # Print deal stats
├── docs/
│   └── analytics.md          # GA4 setup guide
└── .env                      # Environment variables (not committed)
```

## Analytics

See [docs/analytics.md](docs/analytics.md) for GA4 setup and event tracking details.

## Automation

### Daily Deal Refresh

Deals are automatically refreshed daily via GitHub Actions.

**Schedule:** 06:00 UTC (1:00 AM EST / 10:00 PM PST)

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Daily Deal Refresh** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

### View Logs

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Click on **refresh-deals** job to see step-by-step logs

### Required GitHub Secrets

Add these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `TRAVELPAYOUTS_TOKEN` | API token for fetching deals |
| `TRAVELPAYOUTS_MARKER` | Affiliate marker (e.g., `605276`) |
| `VITE_GA4_MEASUREMENT_ID` | GA4 measurement ID (e.g., `G-XXXXXXXXXX`) |

### Optional GitHub Variables

Add these in **Settings > Secrets and variables > Actions > Variables**:

| Variable | Default | Description |
|----------|---------|-------------|
| `BFD_ORIGINS` | `YYZ,YUL,YVR` | Comma-separated IATA codes |
| `BFD_CURRENCY` | `CAD` | Currency for prices |
| `BFD_LIMIT` | `200` | Max deals to keep |

### What Happens on Failure

- **API failure:** Pipeline exits with error, deals.json is NOT overwritten
- **0 deals returned:** Pipeline refuses to overwrite, preserving existing data
- **Build failure:** Workflow fails, no changes committed
- **All failures:** Visible in GitHub Actions logs with clear error messages

### Deploy

Currently, the workflow commits updated `deals.json` back to the repo. To auto-deploy:

1. **Vercel/Netlify:** Connect your repo - deploys trigger on push automatically
2. **GitHub Pages:** Add a deploy step to the workflow
3. **Manual:** Pull latest and run `npm run build`
