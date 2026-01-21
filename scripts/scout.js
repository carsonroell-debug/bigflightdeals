/**
 * Scout - Fetches real flight deals from Travelpayouts API
 *
 * Uses the "Prices for the dates" endpoint which returns cheap flights
 * for given origin airports.
 *
 * API Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  TRAVELPAYOUTS_TOKEN,
  BFD_ORIGINS,
  BFD_CURRENCY,
  BFD_LIMIT,
  RAW_DEALS_PATH,
  validatePipelineEnv,
} from './config.js';

// Validate env vars before proceeding
validatePipelineEnv();

// Travelpayouts API base URL
const API_BASE = 'https://api.travelpayouts.com/aviasales/v3';

/**
 * Fetch cheapest tickets from a given origin
 * Uses the /prices_for_dates endpoint
 */
async function fetchDealsFromOrigin(origin) {
  // Use prices_for_dates endpoint - returns cheapest prices for next 30 days
  const url = new URL(`${API_BASE}/prices_for_dates`);
  url.searchParams.set('origin', origin);
  url.searchParams.set('currency', BFD_CURRENCY);
  url.searchParams.set('token', TRAVELPAYOUTS_TOKEN);
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('direct', 'false'); // include connections
  url.searchParams.set('limit', '30'); // per-origin limit
  url.searchParams.set('one_way', 'false'); // round trips
  url.searchParams.set('page', '1');

  console.log(`  Fetching deals from ${origin}...`);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ERROR: API returned ${response.status} for ${origin}: ${errorText}`);
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`  ERROR: API returned success=false for ${origin}`);
      return [];
    }

    const deals = data.data || [];
    console.log(`  Found ${deals.length} deals from ${origin}`);
    return deals;
  } catch (error) {
    console.error(`  ERROR: Failed to fetch from ${origin}: ${error.message}`);
    return [];
  }
}

/**
 * Transform API response to raw deal format
 */
function transformDeal(apiDeal, origin) {
  return {
    origin: origin,
    destination: apiDeal.destination,
    price: apiDeal.price,
    currency: BFD_CURRENCY,
    depart_date: apiDeal.departure_at ? apiDeal.departure_at.split('T')[0] : null,
    return_date: apiDeal.return_at ? apiDeal.return_at.split('T')[0] : null,
    airline: apiDeal.airline || null,
    flight_number: apiDeal.flight_number || null,
    transfers: apiDeal.transfers ?? null,
    deep_link: apiDeal.link ? `https://www.aviasales.com${apiDeal.link}` : null,
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Main scout function
 */
async function scout() {
  console.log('=== BFD Scout ===');
  console.log(`Origins: ${BFD_ORIGINS.join(', ')}`);
  console.log(`Currency: ${BFD_CURRENCY}`);
  console.log(`Limit: ${BFD_LIMIT}`);
  console.log('');

  const allDeals = [];

  for (const origin of BFD_ORIGINS) {
    const apiDeals = await fetchDealsFromOrigin(origin);
    const transformed = apiDeals.map(d => transformDeal(d, origin));
    allDeals.push(...transformed);

    // Small delay to be nice to the API
    await new Promise(r => setTimeout(r, 200));
  }

  // Sort by price and limit
  allDeals.sort((a, b) => a.price - b.price);
  const limitedDeals = allDeals.slice(0, BFD_LIMIT);

  console.log('');
  console.log(`Total raw deals fetched: ${allDeals.length}`);
  console.log(`After limit (${BFD_LIMIT}): ${limitedDeals.length}`);

  // Ensure directory exists
  mkdirSync(dirname(RAW_DEALS_PATH), { recursive: true });

  // Write raw deals
  writeFileSync(RAW_DEALS_PATH, JSON.stringify(limitedDeals, null, 2));
  console.log(`Written to: ${RAW_DEALS_PATH}`);

  return limitedDeals;
}

// Export for use in pipeline runner
export { scout };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('scout.js')) {
  scout()
    .then(deals => {
      console.log(`\nScout complete: ${deals.length} deals`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Scout failed:', error);
      process.exit(1);
    });
}
