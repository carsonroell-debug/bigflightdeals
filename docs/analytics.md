# Analytics & Affiliate Tracking

## GA4 Setup

1. Create a GA4 property at [Google Analytics](https://analytics.google.com/)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Create a `.env` file in the project root:
   ```
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. Restart the dev server

### Verification

Open browser DevTools > Network tab, click a deal, and look for requests to:
- `google-analytics.com/g/collect`
- The request should include `en=deal_click` in the payload

If GA4 is not configured, you'll see console warnings and events log to console instead.

## Deal Click Events

Every deal card click fires a `deal_click` event with:

| Parameter | Example |
|-----------|---------|
| category | `deal` |
| action | `deal_click` |
| label | `YYZ-LIS | $499 | TAP Air Portugal` |

## Affiliate Links

All outbound deal links are built via `src/lib/affiliate.ts` with:

- **Travelpayouts marker**: Configurable via `VITE_TRAVELPAYOUTS_MARKER` (default: `605276`)
- **UTM parameters**: Automatically appended:
  - `utm_source=bigflightdeals`
  - `utm_medium=affiliate`
  - `utm_campaign=deals`
  - `utm_content={origin}-{destination}`

### Customizing the Affiliate Marker

```
VITE_TRAVELPAYOUTS_MARKER=your_marker_here
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_GA4_MEASUREMENT_ID` | No | - | GA4 Measurement ID |
| `VITE_TRAVELPAYOUTS_MARKER` | No | `605276` | Travelpayouts affiliate marker |
