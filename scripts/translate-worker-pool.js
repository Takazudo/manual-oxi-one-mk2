#!/usr/bin/env node

/**
 * PDF Translation Worker Pool Script
 *
 * This script manages parallel translation of PDF pages using Claude Code's
 * manual-translator subagents in a worker pool pattern.
 *
 * Usage: node scripts/translate-worker-pool.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MAX_WORKERS = 5;
const EXTRACTED_DIR = 'data/extracted';
const OUTPUT_DIR = 'data/translations-draft';

/**
 * Parse extracted text file into individual pages
 */
function parsePages(text) {
  const pages = [];
  const pagePattern = /^-- (\d+) of (\d+) --$/gm;
  const matches = [...text.matchAll(pagePattern)];

  for (let i = 0; i < matches.length; i++) {
    const pageNum = parseInt(matches[i][1]);
    const startIndex = matches[i].index;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
    const pageContent = text.slice(startIndex, endIndex).trim();

    pages.push({
      pageNum,
      content: pageContent,
    });
  }

  return pages;
}

/**
 * Main function to process parts
 */
async function main() {
  console.log('📋 PDF Translation Worker Pool');
  console.log('==================================================\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Find part files
  const partFile = `${EXTRACTED_DIR}/part-01.txt`;

  if (!existsSync(partFile)) {
    console.error(`❌ Error: ${partFile} not found`);
    process.exit(1);
  }

  console.log(`📄 Processing: ${partFile}\n`);

  // Read and parse the extracted text
  const text = readFileSync(partFile, 'utf-8');
  const pages = parsePages(text);

  console.log(`📊 Found ${pages.length} pages to translate\n`);
  console.log('🔧 Worker Pool Configuration:');
  console.log(`   - Max concurrent workers: ${MAX_WORKERS}`);
  console.log(`   - Total pages: ${pages.length}`);
  console.log('\n==================================================\n');

  // Save page breakdown for Claude Code to process
  const pageQueue = {
    partNum: '01',
    totalPages: pages.length,
    pages: pages.map((p) => ({
      pageNum: p.pageNum,
      content: p.content,
      status: 'pending',
    })),
    metadata: {
      maxWorkers: MAX_WORKERS,
      createdAt: new Date().toISOString(),
    },
  };

  const queueFile = `${OUTPUT_DIR}/page-queue-01.json`;
  writeFileSync(queueFile, JSON.stringify(pageQueue, null, 2));

  console.log(`✅ Page queue created: ${queueFile}`);
  console.log('\n📌 Next Steps:');
  console.log('   Claude Code will now process these pages using worker pool pattern');
  console.log('   - Spawn 5 concurrent manual-translator subagents');
  console.log('   - Each worker translates one page at a time');
  console.log('   - Results are collected and combined in order\n');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
