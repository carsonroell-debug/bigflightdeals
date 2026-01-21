/**
 * Report - Outputs stats about canonical deals
 *
 * Usage: node scripts/report.js
 */

import { readFileSync, existsSync } from 'fs';
import { CANONICAL_DEALS_PATH } from './config.js';

function report() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     BFD Deals Report                   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // Check if deals file exists
  if (!existsSync(CANONICAL_DEALS_PATH)) {
    console.error(`ERROR: Deals file not found: ${CANONICAL_DEALS_PATH}`);
    console.error('Run the pipeline first: npm run pipeline');
    process.exit(1);
  }

  // Load deals
  const data = readFileSync(CANONICAL_DEALS_PATH, 'utf-8');
  const deals = JSON.parse(data);

  console.log(`Total deals: ${deals.length}`);
  console.log('');

  // Deals per origin
  const originCounts = {};
  for (const deal of deals) {
    const key = `${deal.origin_code} (${deal.origin})`;
    originCounts[key] = (originCounts[key] || 0) + 1;
  }

  console.log('Deals per origin:');
  console.log('─────────────────────────────────────────');
  for (const [origin, count] of Object.entries(originCounts).sort((a, b) => b[1] - a[1])) {
    const bar = '█'.repeat(Math.min(count, 30));
    console.log(`  ${origin.padEnd(20)} ${String(count).padStart(4)} ${bar}`);
  }
  console.log('');

  // Unique routes
  const routes = new Set(deals.map(d => `${d.origin_code}-${d.destination_code}`));
  console.log(`Unique routes: ${routes.size}`);
  console.log('');

  // Top 10 cheapest deals
  const sorted = [...deals].sort((a, b) => a.price - b.price);
  const top10 = sorted.slice(0, 10);

  console.log('Top 10 Cheapest Deals:');
  console.log('─────────────────────────────────────────');
  for (let i = 0; i < top10.length; i++) {
    const deal = top10[i];
    const route = `${deal.origin_code} → ${deal.destination_code}`;
    const price = `$${deal.price} ${deal.currency}`;
    const date = deal.depart_date ? ` (${deal.depart_date})` : '';
    console.log(`  ${(i + 1).toString().padStart(2)}. ${route.padEnd(12)} ${price.padEnd(12)}${date}`);
  }
  console.log('');

  // Price range per origin
  console.log('Price range per origin:');
  console.log('─────────────────────────────────────────');
  const origins = [...new Set(deals.map(d => d.origin_code))];
  for (const origin of origins.sort()) {
    const originDeals = deals.filter(d => d.origin_code === origin);
    const prices = originDeals.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    console.log(`  ${origin}: $${min} - $${max} (avg: $${avg})`);
  }
  console.log('');

  // Last updated
  if (deals.length > 0 && deals[0].last_seen) {
    const lastSeen = new Date(deals[0].last_seen);
    console.log(`Last updated: ${lastSeen.toLocaleString()}`);
  }
}

// Run
try {
  report();
  process.exit(0);
} catch (error) {
  console.error('Report failed:', error);
  process.exit(1);
}
