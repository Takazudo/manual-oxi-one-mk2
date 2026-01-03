#!/usr/bin/env node

/**
 * Translation Verification Script
 *
 * Verifies that translations match their source content by checking:
 * 1. Page numbers match in English and Japanese
 * 2. Section titles are correctly translated
 * 3. No duplicate translations
 * 4. All pages are present
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('🔍 Translation Verification Script');
console.log('='.repeat(50));
console.log('');

// Load files
const EXTRACTED_FILE = join(ROOT_DIR, 'data/extracted/part-01.txt');
const RESULTS_FILE = join(ROOT_DIR, 'data/translations-draft/translation-results.json');

const extractedText = readFileSync(EXTRACTED_FILE, 'utf-8');
const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'));

// Extract page boundaries from source text
const pagePattern = /^-- (\d+) of (\d+) --$/gm;
const matches = [...extractedText.matchAll(pagePattern)];

console.log(`📄 Found ${matches.length} pages in extracted text`);
console.log(`📄 Found ${Object.keys(results.translations).length} pages in translations`);
console.log('');

const errors = [];
const warnings = [];

// Verify each page
for (let i = 0; i < matches.length; i++) {
  const pageNum = parseInt(matches[i][1]);
  const startIdx = matches[i].index;
  const endIdx = i < matches.length - 1 ? matches[i + 1].index : extractedText.length;
  const englishContent = extractedText.slice(startIdx, endIdx).trim();

  // Get Japanese translation
  const japaneseContent = results.translations[pageNum.toString()];

  if (!japaneseContent) {
    errors.push(`Page ${pageNum}: Missing translation`);
    continue;
  }

  // Extract first non-empty line from English (usually page number + title)
  const englishLines = englishContent.split('\n').filter((l) => l.trim());
  const englishHeader = englishLines.slice(0, 3).join(' ').trim();

  // Extract from Japanese
  const japaneseLines = japaneseContent.split('\n').filter((l) => l.trim());
  const japaneseHeader = japaneseLines.slice(0, 3).join(' ').trim();

  // Check if page marker matches
  const englishPageMarker = englishContent.match(/^-- (\d+) of (\d+) --/);
  const japanesePageMarker = japaneseContent.match(/^-- (\d+) of (\d+) --/);

  if (!japanesePageMarker) {
    errors.push(`Page ${pageNum}: Missing page marker in translation`);
    continue;
  }

  if (englishPageMarker[1] !== japanesePageMarker[1]) {
    errors.push(
      `Page ${pageNum}: Page marker mismatch! English has page ${englishPageMarker[1]}, Japanese has page ${japanesePageMarker[1]}`,
    );
  }

  // Extract section numbers (like "3.5", "3.6", etc.)
  const englishSection = englishHeader.match(/\b\d+\.\d+\b/);
  const japaneseSection = japaneseHeader.match(/\b\d+\.\d+\b/);

  if (englishSection && japaneseSection && englishSection[0] !== japaneseSection[0]) {
    errors.push(
      `Page ${pageNum}: Section number mismatch! English="${englishSection[0]}", Japanese="${japaneseSection[0]}"`,
    );
    warnings.push(`  English preview: ${englishHeader.substring(0, 100)}`);
    warnings.push(`  Japanese preview: ${japaneseHeader.substring(0, 100)}`);
  }

  // Check for very short translations (likely incomplete)
  if (japaneseContent.length < 100) {
    warnings.push(
      `Page ${pageNum}: Translation seems very short (${japaneseContent.length} chars)`,
    );
  }
}

// Check for duplicate translations
const translationHashes = new Map();
for (const [pageNum, content] of Object.entries(results.translations)) {
  // Use first 200 chars as fingerprint
  const fingerprint = content.substring(0, 200);
  if (translationHashes.has(fingerprint)) {
    errors.push(
      `Page ${pageNum}: Duplicate translation detected! Same as page ${translationHashes.get(fingerprint)}`,
    );
  } else {
    translationHashes.set(fingerprint, pageNum);
  }
}

// Report results
console.log('='.repeat(50));
console.log('📊 Verification Results:');
console.log('');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All translations verified successfully!');
} else {
  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach((err) => console.log(`   ${err}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warnings:`);
    warnings.forEach((warn) => console.log(`   ${warn}`));
    console.log('');
  }
}

// Exit with error code if errors found
if (errors.length > 0) {
  console.log('❌ Verification failed!');
  process.exit(1);
} else {
  console.log('✅ Verification passed!');
  process.exit(0);
}
