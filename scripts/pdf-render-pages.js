#!/usr/bin/env node

/**
 * PDF Page Rendering Script
 * Renders PDF pages to PNG images at specified DPI
 *
 * Input: manual-pdf/parts/part-*.pdf
 * Output: public/manual/pages/page_001.png, page_002.png, etc.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load configuration
const config = JSON.parse(readFileSync(join(ROOT_DIR, 'pdf-config.json'), 'utf-8'));

// Configure PDF.js
const CMAP_URL = '../node_modules/pdfjs-dist/cmaps/';
const CMAP_PACKED = true;

async function renderPage(page, pageNumber, outputDir, dpi) {
  const viewport = page.getViewport({ scale: dpi / 72 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  // Convert canvas to PNG using sharp for better quality
  const buffer = canvas.toBuffer('image/png');
  const outputPath = join(outputDir, `page_${String(pageNumber).padStart(3, '0')}.png`);

  // Use sharp to optimize the PNG
  await sharp(buffer)
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      force: true,
    })
    .toFile(outputPath);

  return outputPath;
}

async function renderPdfPages() {
  console.log('🖼️  PDF Page Rendering Script');
  console.log('='.repeat(50));

  const partsDir = join(ROOT_DIR, config.output.parts);
  const outputDir = join(ROOT_DIR, config.output.images);
  const dpi = config.settings.imageDPI;

  // Check if parts directory exists
  if (!existsSync(partsDir)) {
    console.error(`❌ Parts directory not found: ${partsDir}`);
    console.error('   Please run pdf:split first');
    process.exit(1);
  }

  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📁 Input directory: ${partsDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`🎨 DPI: ${dpi}`);
  console.log('');

  // Get all part PDFs
  const partFiles = readdirSync(partsDir)
    .filter((file) => file.startsWith('part-') && file.endsWith('.pdf'))
    .sort();

  if (partFiles.length === 0) {
    console.error(`❌ No part PDFs found in: ${partsDir}`);
    console.error('   Please run pdf:split first');
    process.exit(1);
  }

  console.log(`📚 Found ${partFiles.length} part PDFs`);
  console.log('');

  let globalPageNumber = 1;
  let totalPagesRendered = 0;

  // Process each part
  for (const partFile of partFiles) {
    const partPath = join(partsDir, partFile);
    const partNumber = partFile.match(/part-(\d+)\.pdf/)?.[1];

    console.log(`📄 Processing ${partFile}...`);

    try {
      // Load PDF
      const pdfData = new Uint8Array(readFileSync(partPath));
      const loadingTask = pdfjsLib.getDocument({
        data: pdfData,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
        standardFontDataUrl: '../node_modules/pdfjs-dist/standard_fonts/',
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      console.log(`   📊 Pages in this part: ${numPages}`);

      // Render each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const outputPath = await renderPage(page, globalPageNumber, outputDir, dpi);

        process.stdout.write(
          `   ✅ Rendered page ${globalPageNumber} (${partFile} p.${pageNum})\r`,
        );

        globalPageNumber++;
        totalPagesRendered++;
      }

      console.log(''); // New line after progress
      console.log(`   ✨ Completed ${partFile}`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing ${partFile}:`, error.message);
      process.exit(1);
    }
  }

  console.log('='.repeat(50));
  console.log(`✨ Successfully rendered ${totalPagesRendered} pages`);
  console.log(`📁 Output location: ${outputDir}`);
}

// Run script
renderPdfPages().catch((error) => {
  console.error('');
  console.error('❌ Error rendering pages:');
  console.error(error);
  process.exit(1);
});
