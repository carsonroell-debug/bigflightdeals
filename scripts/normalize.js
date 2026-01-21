/**
 * Normalize - Validates, deduplicates, and enriches raw deals
 *
 * Reads raw_deals.json → validates → dedupes → enriches → writes deals.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import {
  TRAVELPAYOUTS_MARKER,
  RAW_DEALS_PATH,
  CANONICAL_DEALS_PATH,
  getCityName,
} from './config.js';

/**
 * Generate a stable hash ID for a deal
 */
function generateDealId(deal) {
  const key = [
    deal.origin,
    deal.destination,
    deal.price,
    deal.depart_date || '',
    deal.return_date || '',
  ].join('|');

  const hash = createHash('md5').update(key).digest('hex').slice(0, 8);
  return `${deal.origin.toLowerCase()}-${deal.destination.toLowerCase()}-${deal.price}-${hash}`;
}

/**
 * Build affiliate URL with marker and UTMs
 */
function buildAffiliateUrl(deal) {
  const origin = deal.origin;
  const destination = deal.destination;

  // Build base URL
  let baseUrl;
  if (deal.deep_link) {
    // Use the deep link from API if available
    baseUrl = deal.deep_link;
    // Add marker if not present
    if (!baseUrl.includes('marker=')) {
      const sep = baseUrl.includes('?') ? '&' : '?';
      baseUrl = `${baseUrl}${sep}marker=${TRAVELPAYOUTS_MARKER}`;
    }
  } else {
    // Build Aviasales search URL
    // Format: origin + destination + "1" for one-way search starting point
    baseUrl = `https://www.aviasales.com/search/${origin}${destination}1?marker=${TRAVELPAYOUTS_MARKER}`;

    // Add dates if available
    if (deal.depart_date) {
      const departFormatted = deal.depart_date.replace(/-/g, '');
      baseUrl = baseUrl.replace(
        `/${origin}${destination}1`,
        `/${origin}${departFormatted}${destination}`
      );
      if (deal.return_date) {
        const returnFormatted = deal.return_date.replace(/-/g, '');
        baseUrl = baseUrl.replace(
          `${destination}`,
          `${destination}${returnFormatted}`
        );
      } else {
        baseUrl += '1'; // one-way indicator
      }
    }
  }

  // Add UTM parameters
  const utmParams = new URLSearchParams({
    utm_source: 'bigflightdeals',
    utm_medium: 'affiliate',
    utm_campaign: 'deals',
    utm_content: `${origin}-${destination}`,
  });

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${utmParams.toString()}`;
}

/**
 * Validate a raw deal has required fields
 */
function isValidDeal(deal) {
  if (!deal.origin || typeof deal.origin !== 'string' || deal.origin.length !== 3) {
    return false;
  }
  if (!deal.destination || typeof deal.destination !== 'string' || deal.destination.length !== 3) {
    return false;
  }
  if (typeof deal.price !== 'number' || deal.price <= 0 || isNaN(deal.price)) {
    return false;
  }
  if (!deal.currency) {
    return false;
  }
  return true;
}

/**
 * Generate dedupe key
 */
function getDedupeKey(deal) {
  return [
    deal.origin,
    deal.destination,
    deal.price,
    deal.depart_date || '',
  ].join('|');
}

/**
 * Transform raw deal to canonical format
 */
function transformToCanonical(rawDeal) {
  const origin = rawDeal.origin.toUpperCase();
  const destination = rawDeal.destination.toUpperCase();

  return {
    id: generateDealId(rawDeal),
    origin: getCityName(origin),
    origin_code: origin,
    destination: getCityName(destination),
    destination_code: destination,
    price: rawDeal.price,
    currency: rawDeal.currency,
    airline: rawDeal.airline || 'Various',
    depart_date: rawDeal.depart_date || null,
    return_date: rawDeal.return_date || null,
    transfers: rawDeal.transfers,
    link: buildAffiliateUrl(rawDeal),
    last_seen: new Date().toISOString(),
  };
}

/**
 * Main normalize function
 */
async function normalize() {
  console.log('=== BFD Normalize ===');

  // Check if raw deals file exists
  if (!existsSync(RAW_DEALS_PATH)) {
    console.error(`ERROR: Raw deals file not found: ${RAW_DEALS_PATH}`);
    console.error('Run scout first: node scripts/scout.js');
    process.exit(1);
  }

  // Read raw deals
  const rawData = readFileSync(RAW_DEALS_PATH, 'utf-8');
  const rawDeals = JSON.parse(rawData);
  console.log(`Raw deals loaded: ${rawDeals.length}`);

  // Validate
  const validDeals = rawDeals.filter(deal => {
    const valid = isValidDeal(deal);
    if (!valid) {
      console.log(`  Dropping invalid deal: ${JSON.stringify(deal).slice(0, 100)}`);
    }
    return valid;
  });
  console.log(`After validation: ${validDeals.length}`);

  // Deduplicate
  const seen = new Set();
  const deduped = [];
  for (const deal of validDeals) {
    const key = getDedupeKey(deal);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(deal);
    }
  }
  console.log(`After dedupe: ${deduped.length}`);

  // Transform to canonical format
  const canonicalDeals = deduped.map(transformToCanonical);

  // Sort by origin, then by price
  canonicalDeals.sort((a, b) => {
    if (a.origin_code !== b.origin_code) {
      return a.origin_code.localeCompare(b.origin_code);
    }
    return a.price - b.price;
  });

  // Calculate stats
  const uniqueRoutes = new Set(canonicalDeals.map(d => `${d.origin_code}-${d.destination_code}`));
  const originCounts = {};
  for (const deal of canonicalDeals) {
    originCounts[deal.origin_code] = (originCounts[deal.origin_code] || 0) + 1;
  }

  console.log('');
  console.log('Stats:');
  console.log(`  Total valid deals: ${canonicalDeals.length}`);
  console.log(`  Unique routes: ${uniqueRoutes.size}`);
  console.log('  Deals per origin:');
  for (const [origin, count] of Object.entries(originCounts)) {
    console.log(`    ${origin}: ${count}`);
  }

  // SAFETY GUARD: Do not overwrite deals.json with empty data
  if (canonicalDeals.length === 0) {
    console.error('');
    console.error('ERROR: 0 valid deals after normalization!');
    console.error('Refusing to overwrite canonical deals.json to preserve existing data.');
    console.error('Check API connectivity and credentials.');
    throw new Error('Zero deals - aborting to preserve existing data');
  }

  // Write canonical deals
  writeFileSync(CANONICAL_DEALS_PATH, JSON.stringify(canonicalDeals, null, 2));
  console.log(`\nWritten to: ${CANONICAL_DEALS_PATH}`);

  return {
    total: canonicalDeals.length,
    uniqueRoutes: uniqueRoutes.size,
    originCounts,
    deals: canonicalDeals,
  };
}

// Export for use in pipeline runner
export { normalize };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('normalize.js')) {
  normalize()
    .then(result => {
      console.log(`\nNormalize complete: ${result.total} deals, ${result.uniqueRoutes} routes`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Normalize failed:', error);
      process.exit(1);
    });
}
