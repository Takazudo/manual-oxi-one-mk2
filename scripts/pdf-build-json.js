#!/usr/bin/env node

/**
 * PDF JSON Builder Script
 * Combines extracted text, translations, and images into final JSON structure
 *
 * Input:
 *   - data/extracted/part-*.txt
 *   - data/translations-draft/part-*.json
 *   - public/manual/pages/page_*.png
 * Output: data/translations/part-01.json, part-02.json, etc.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load configuration
const config = JSON.parse(readFileSync(join(ROOT_DIR, 'pdf-config.json'), 'utf-8'));

function buildPartJson(partNumber, partInfo, translationData, startPageNum) {
  const pages = [];

  // Build pages array
  for (let i = 0; i < partInfo.pages; i++) {
    const globalPageNum = startPageNum + i;
    const pageNum = i + 1; // Local page number in this part

    pages.push({
      pageNum: pageNum,
      globalPageNum: globalPageNum,
      image: `/manual/pages/page_${String(globalPageNum).padStart(3, '0')}.png`,
      title: `Page ${globalPageNum}`,
      sectionName: null, // To be filled manually or by future enhancement
      translation: translationData?.translation || '',
      hasContent: !!translationData?.translation,
    });
  }

  return {
    part: partNumber,
    totalPages: partInfo.pages,
    metadata: {
      title: `OXI ONE MKII Manual - Part ${partNumber}`,
      sections: [], // To be filled manually or by future enhancement
      translatedAt: translationData?.metadata?.translatedAt || new Date().toISOString(),
      translationModel: translationData?.metadata?.model || config.settings.translationModel,
    },
    pages: pages,
  };
}

async function buildAllJson() {
  console.log('🏗️  PDF JSON Builder Script');
  console.log('='.repeat(50));

  const translationsDraftDir = join(ROOT_DIR, config.output.translationsDraft);
  const outputDir = join(ROOT_DIR, config.output.translations);
  const imagesDir = join(ROOT_DIR, config.output.images);

  // Check if translations directory exists
  if (!existsSync(translationsDraftDir)) {
    console.error(`❌ Translations draft directory not found: ${translationsDraftDir}`);
    console.error('   Please run pdf:translate first');
    process.exit(1);
  }

  // Check if images directory exists
  if (!existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`);
    console.error('   Please run pdf:render first');
    process.exit(1);
  }

  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📁 Translations draft: ${translationsDraftDir}`);
  console.log(`📁 Images: ${imagesDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('');

  let totalPartsProcessed = 0;

  // Process each part from config
  for (const [partKey, partInfo] of Object.entries(config.partConfig)) {
    const partNumber = partKey.replace('part', '');
    const translationFile = `part-${partNumber}.json`;
    const translationPath = join(translationsDraftDir, translationFile);

    console.log(`📄 Processing Part ${partNumber}...`);

    // Load translation data if exists
    let translationData = null;
    if (existsSync(translationPath)) {
      translationData = JSON.parse(readFileSync(translationPath, 'utf-8'));
      console.log(`   ✅ Translation loaded`);
    } else {
      console.log(`   ⚠️  No translation found, creating empty structure`);
    }

    // Build JSON structure
    const partJson = buildPartJson(partNumber, partInfo, translationData, partInfo.startPage);

    // Save to file
    const outputPath = join(outputDir, `part-${partNumber}.json`);
    writeFileSync(outputPath, JSON.stringify(partJson, null, 2), 'utf-8');

    console.log(`   💾 Saved: ${outputPath}`);
    console.log(`   📊 Pages: ${partInfo.pages}`);
    console.log('');

    totalPartsProcessed++;
  }

  console.log('='.repeat(50));
  console.log(`✨ Successfully built JSON for ${totalPartsProcessed} parts`);
  console.log(`📁 Output location: ${outputDir}`);
  console.log('');
  console.log('⚠️  Note: Section names and page titles need manual refinement');
  console.log('   You can edit the JSON files directly to add proper sections and titles');
}

// Run script
buildAllJson().catch((error) => {
  console.error('');
  console.error('❌ Error building JSON:');
  console.error(error);
  process.exit(1);
});
