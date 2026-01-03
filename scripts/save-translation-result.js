#!/usr/bin/env node

/**
 * Save Translation Result
 *
 * Usage: node scripts/save-translation-result.js <pageNum> <translation>
 */

import { readFileSync, writeFileSync } from 'fs';

const RESULTS_FILE = 'data/translations-draft/translation-results.json';

const pageNum = parseInt(process.argv[2]);
const translation = process.argv[3];

if (!pageNum || !translation) {
  console.error('Usage: node save-translation-result.js <pageNum> <translation>');
  process.exit(1);
}

// Read current results
const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'));

// Add page marker if missing
const pageMarker = `-- ${pageNum} of 30 --\n\n`;
const fullTranslation = translation.startsWith('--') ? translation : pageMarker + translation;

// Save translation
results.translations[pageNum] = fullTranslation;

// Update metadata
results.metadata.lastUpdated = new Date().toISOString();
results.metadata.completedPages = Object.keys(results.translations).length;

// Save back to file
writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

console.log(`✅ Saved translation for page ${pageNum}`);
console.log(`📊 Progress: ${results.metadata.completedPages}/30 pages completed`);
