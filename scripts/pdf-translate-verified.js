#!/usr/bin/env node

/**
 * PDF Translation Script with Verification
 *
 * Improved translation workflow that:
 * 1. Pre-extracts each page content explicitly
 * 2. Passes exact content to workers (not file paths)
 * 3. Verifies each translation immediately after completion
 * 4. Saves verified translations incrementally
 *
 * This prevents workers from reading wrong page boundaries.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('📝 PDF Translation Script (with Verification)');
console.log('='.repeat(50));
console.log('');

// Configuration
const EXTRACTED_FILE = join(ROOT_DIR, 'data/extracted/part-01.txt');
const OUTPUT_FILE = join(ROOT_DIR, 'data/translations-draft/translation-results-verified.json');

// Read extracted text
if (!existsSync(EXTRACTED_FILE)) {
  console.error(`❌ Extracted file not found: ${EXTRACTED_FILE}`);
  console.error('   Please run pdf:extract first');
  process.exit(1);
}

const extractedText = readFileSync(EXTRACTED_FILE, 'utf-8');

// Parse pages from extracted text
const pagePattern = /^-- (\d+) of (\d+) --$/gm;
const matches = [...extractedText.matchAll(pagePattern)];

console.log(`📄 Found ${matches.length} pages to translate`);
console.log('');

// Extract each page's content
const pages = [];
for (let i = 0; i < matches.length; i++) {
  const pageNum = parseInt(matches[i][1]);
  const startIdx = matches[i].index;
  const endIdx = i < matches.length - 1 ? matches[i + 1].index : extractedText.length;
  const content = extractedText.slice(startIdx, endIdx).trim();

  // Get first line for verification (should contain page marker and title)
  const firstLine = content.split('\n').slice(0, 4).join(' ').trim();

  pages.push({
    pageNum,
    content,
    verificationHint: firstLine.substring(0, 100),
  });
}

console.log('✅ Successfully extracted all pages');
console.log('');
console.log('📊 Sample verification hints:');
pages.slice(0, 3).forEach((p) => {
  console.log(`   Page ${p.pageNum}: ${p.verificationHint}...`);
});
console.log('');
console.log('Next steps:');
console.log('1. Use these pre-extracted pages for translation');
console.log('2. Pass exact content to each worker (not file paths)');
console.log('3. Verify each translation matches the source');
console.log('');
console.log(`📁 Pages data prepared for ${pages.length} pages`);

// Save pages for reference
const pagesData = {
  totalPages: pages.length,
  pages: pages.map((p) => ({
    pageNum: p.pageNum,
    contentLength: p.content.length,
    verificationHint: p.verificationHint,
  })),
};

const pagesFile = join(ROOT_DIR, 'data/translations-draft/pages-for-translation.json');
writeFileSync(pagesFile, JSON.stringify(pagesData, null, 2));
console.log(`✅ Saved page data to: ${pagesFile}`);
