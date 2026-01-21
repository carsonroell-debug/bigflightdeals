/**
 * Pipeline Runner - Executes scout then normalize in sequence
 *
 * Usage: node scripts/run_pipeline.js
 */

import { scout } from './scout.js';
import { normalize } from './normalize.js';

async function runPipeline() {
  const startTime = Date.now();

  console.log('╔════════════════════════════════════════╗');
  console.log('║     BFD Deal Pipeline                  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // Step 1: Scout
  console.log('┌─ STEP 1: Scout ─────────────────────────');
  let rawDeals;
  try {
    rawDeals = await scout();
  } catch (error) {
    console.error('Scout failed:', error.message);
    process.exit(1);
  }
  console.log('└─────────────────────────────────────────');
  console.log('');

  // Step 2: Normalize
  console.log('┌─ STEP 2: Normalize ─────────────────────');
  let normalizeResult;
  try {
    normalizeResult = await normalize();
  } catch (error) {
    console.error('Normalize failed:', error.message);
    process.exit(1);
  }
  console.log('└─────────────────────────────────────────');
  console.log('');

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('╔════════════════════════════════════════╗');
  console.log('║     Pipeline Summary                   ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Raw deals fetched:    ${String(rawDeals.length).padStart(6)}          ║`);
  console.log(`║  Valid deals:          ${String(normalizeResult.total).padStart(6)}          ║`);
  console.log(`║  Unique routes:        ${String(normalizeResult.uniqueRoutes).padStart(6)}          ║`);
  console.log(`║  Time elapsed:         ${elapsed.padStart(6)}s         ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('Pipeline complete! Run `npm run build && npm run preview` to test.');

  return {
    rawDeals: rawDeals.length,
    validDeals: normalizeResult.total,
    uniqueRoutes: normalizeResult.uniqueRoutes,
    elapsed,
  };
}

// Run
runPipeline()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Pipeline failed:', error);
    process.exit(1);
  });
