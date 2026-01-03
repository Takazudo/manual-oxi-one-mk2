#!/usr/bin/env node

/**
 * PDF Manifest Creator Script
 * Generates manifest.json from all part JSON files
 *
 * Input: data/translations/part-*.json
 * Output: data/translations/manifest.json
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load configuration
const config = JSON.parse(readFileSync(join(ROOT_DIR, 'pdf-config.json'), 'utf-8'));

function createManifest() {
  console.log('📋 PDF Manifest Creator Script');
  console.log('='.repeat(50));

  const translationsDir = join(ROOT_DIR, config.output.translations);

  // Check if translations directory exists
  if (!existsSync(translationsDir)) {
    console.error(`❌ Translations directory not found: ${translationsDir}`);
    console.error('   Please run pdf:build first');
    process.exit(1);
  }

  console.log(`📁 Input directory: ${translationsDir}`);
  console.log('');

  // Get all part JSON files
  const partFiles = readdirSync(translationsDir)
    .filter(
      (file) => file.startsWith('part-') && file.endsWith('.json') && file !== 'manifest.json',
    )
    .sort();

  if (partFiles.length === 0) {
    console.error(`❌ No part JSON files found in: ${translationsDir}`);
    console.error('   Please run pdf:build first');
    process.exit(1);
  }

  console.log(`📚 Found ${partFiles.length} part JSON files`);
  console.log('');

  const parts = [];
  let totalPages = 0;

  // Process each part
  for (const partFile of partFiles) {
    const partPath = join(translationsDir, partFile);
    const partData = JSON.parse(readFileSync(partPath, 'utf-8'));

    console.log(`📄 Processing ${partFile}...`);
    console.log(`   Part: ${partData.part}`);
    console.log(`   Pages: ${partData.totalPages}`);
    console.log(`   Title: ${partData.metadata.title}`);

    const startPage = totalPages + 1;
    const endPage = startPage + partData.totalPages - 1;

    parts.push({
      part: partData.part,
      title: partData.metadata.title,
      file: `/data/translations/part-${partData.part}.json`,
      totalPages: partData.totalPages,
      pageRange: [startPage, endPage],
      sections: partData.metadata.sections,
    });

    totalPages += partData.totalPages;
    console.log(`   ✅ Added to manifest`);
    console.log('');
  }

  // Create manifest
  const manifest = {
    version: '1.0.0',
    title: 'OXI ONE MKII Manual',
    totalPages: totalPages,
    totalParts: parts.length,
    parts: parts,
    metadata: {
      createdAt: new Date().toISOString(),
      imageFormat: config.settings.imageFormat,
      imageDPI: config.settings.imageDPI,
      translationModel: config.settings.translationModel,
    },
  };

  // Save manifest
  const manifestPath = join(translationsDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('='.repeat(50));
  console.log(`✨ Successfully created manifest`);
  console.log(`📊 Total pages: ${totalPages}`);
  console.log(`📊 Total parts: ${parts.length}`);
  console.log(`💾 Saved: ${manifestPath}`);
  console.log('');
  console.log('📖 Manifest structure:');
  console.log(JSON.stringify(manifest, null, 2));
}

// Run script
createManifest();
