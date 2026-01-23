/**
 * Validate - Enforces schema and guardrails on canonical deals.json
 *
 * FAILS LOUDLY if:
 * - Schema is violated
 * - Affiliate links are missing
 * - JSON is invalid
 * - Zero deals present
 */

import { readFileSync, existsSync } from 'fs';
import { CANONICAL_DEALS_PATH, TRAVELPAYOUTS_MARKER } from './config.js';

// Required fields per deal schema
const REQUIRED_FIELDS = [
  'id',
  'origin',
  'origin_code',
  'destination',
  'destination_code',
  'price',
  'currency',
  'link',
  'last_seen',
];

// Validate a single deal
function validateDeal(deal, index) {
  const errors = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (deal[field] === undefined || deal[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate types
  if (typeof deal.price !== 'number' || deal.price <= 0 || isNaN(deal.price)) {
    errors.push(`Invalid price: ${deal.price}`);
  }

  if (typeof deal.origin_code !== 'string' || deal.origin_code.length !== 3) {
    errors.push(`Invalid origin_code: ${deal.origin_code}`);
  }

  if (typeof deal.destination_code !== 'string' || deal.destination_code.length !== 3) {
    errors.push(`Invalid destination_code: ${deal.destination_code}`);
  }

  // CRITICAL: Validate affiliate link exists and contains marker
  if (!deal.link || typeof deal.link !== 'string') {
    errors.push('Missing affiliate link');
  } else if (!deal.link.includes('marker=')) {
    errors.push(`Affiliate link missing marker parameter: ${deal.link.slice(0, 80)}...`);
  } else if (!deal.link.includes(TRAVELPAYOUTS_MARKER)) {
    errors.push(`Affiliate link has wrong marker (expected ${TRAVELPAYOUTS_MARKER})`);
  }

  // Validate URL format
  if (deal.link && !deal.link.startsWith('https://')) {
    errors.push(`Affiliate link not HTTPS: ${deal.link.slice(0, 50)}...`);
  }

  return errors;
}

function validate() {
  console.log('=== BFD Validator ===');
  console.log('');

  // Check if file exists
  if (!existsSync(CANONICAL_DEALS_PATH)) {
    console.error('FATAL: deals.json not found at:', CANONICAL_DEALS_PATH);
    console.error('Run `npm run pipeline` first.');
    process.exit(1);
  }

  // Try to parse JSON
  let deals;
  try {
    const data = readFileSync(CANONICAL_DEALS_PATH, 'utf-8');
    deals = JSON.parse(data);
  } catch (error) {
    console.error('FATAL: Invalid JSON in deals.json');
    console.error(error.message);
    process.exit(1);
  }

  // Check it's an array
  if (!Array.isArray(deals)) {
    console.error('FATAL: deals.json must be an array');
    process.exit(1);
  }

  // Check not empty
  if (deals.length === 0) {
    console.error('FATAL: deals.json is empty (0 deals)');
    console.error('This would break the site. Refusing to proceed.');
    process.exit(1);
  }

  console.log(`Validating ${deals.length} deals...`);
  console.log('');

  // Validate each deal
  let totalErrors = 0;
  const dealErrors = [];

  for (let i = 0; i < deals.length; i++) {
    const errors = validateDeal(deals[i], i);
    if (errors.length > 0) {
      totalErrors += errors.length;
      dealErrors.push({ index: i, id: deals[i].id || 'unknown', errors });
    }
  }

  // Report results
  if (totalErrors > 0) {
    console.error('VALIDATION FAILED');
    console.error('');
    console.error(`Found ${totalErrors} errors in ${dealErrors.length} deals:`);
    console.error('');

    // Show first 10 problem deals
    for (const { index, id, errors } of dealErrors.slice(0, 10)) {
      console.error(`  Deal #${index} (${id}):`);
      for (const err of errors) {
        console.error(`    - ${err}`);
      }
    }

    if (dealErrors.length > 10) {
      console.error(`  ... and ${dealErrors.length - 10} more deals with errors`);
    }

    console.error('');
    console.error('Fix these issues before deploying.');
    process.exit(1);
  }

  // All good
  console.log('VALIDATION PASSED');
  console.log('');
  console.log('Summary:');
  console.log(`  Total deals: ${deals.length}`);
  console.log(`  All deals have valid schema`);
  console.log(`  All deals have affiliate links with marker ${TRAVELPAYOUTS_MARKER}`);
  console.log('');

  // Quick stats
  const origins = [...new Set(deals.map(d => d.origin_code))];
  const routes = [...new Set(deals.map(d => `${d.origin_code}-${d.destination_code}`))];
  const prices = deals.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  console.log('Stats:');
  console.log(`  Origins: ${origins.join(', ')}`);
  console.log(`  Unique routes: ${routes.length}`);
  console.log(`  Price range: $${minPrice} - $${maxPrice}`);

  return { valid: true, count: deals.length };
}

// Run
try {
  validate();
  process.exit(0);
} catch (error) {
  console.error('Validator crashed:', error);
  process.exit(1);
}
