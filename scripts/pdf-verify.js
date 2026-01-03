#!/usr/bin/env node

/**
 * PDF Verify Script
 * Validates all generated files from PDF processing
 *
 * Checks:
 * - All expected files exist
 * - JSON structure is valid
 * - Images have correct dimensions (300 DPI)
 * - Page numbering is continuous
 * - No missing translations
 * - Manifest matches part files
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import imageSize from 'image-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load configuration
const config = JSON.parse(readFileSync(join(ROOT_DIR, 'pdf-config.json'), 'utf-8'));

console.log('🔍 PDF Verification Script');
console.log('='.repeat(50));
console.log('');

let errorCount = 0;
let warningCount = 0;

function error(message) {
  console.log(`❌ ${message}`);
  errorCount++;
}

function warning(message) {
  console.log(`⚠️  ${message}`);
  warningCount++;
}

function success(message) {
  console.log(`✅ ${message}`);
}

/**
 * Verify manifest.json exists and is valid
 */
function verifyManifest() {
  console.log('📋 Verifying manifest.json...');

  const manifestPath = join(ROOT_DIR, config.output.translations, 'manifest.json');

  if (!existsSync(manifestPath)) {
    error('Manifest file not found: data/translations/manifest.json');
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    // Check required fields
    if (!manifest.title) error('Manifest missing title');
    if (!manifest.version) error('Manifest missing version');
    if (!manifest.totalPages) error('Manifest missing totalPages');
    if (!manifest.parts || !Array.isArray(manifest.parts))
      error('Manifest missing or invalid parts array');

    success(`Manifest valid (${manifest.totalPages} total pages, ${manifest.parts.length} parts)`);

    return manifest;
  } catch (err) {
    error(`Manifest JSON parse error: ${err.message}`);
    return null;
  }
}

/**
 * Verify part JSON files
 */
function verifyPartFiles(manifest) {
  console.log('');
  console.log('📄 Verifying part JSON files...');

  if (!manifest) {
    error('Cannot verify part files without valid manifest');
    return;
  }

  const translationsDir = join(ROOT_DIR, config.output.translations);

  for (const partEntry of manifest.parts) {
    const partNum = partEntry.part;
    const partPath = join(translationsDir, `part-${partNum}.json`);

    if (!existsSync(partPath)) {
      error(`Part file not found: part-${partNum}.json`);
      continue;
    }

    try {
      const partData = JSON.parse(readFileSync(partPath, 'utf-8'));

      // Verify structure
      if (!partData.part) error(`Part ${partNum}: missing 'part' field`);
      if (!partData.pageRange || !Array.isArray(partData.pageRange))
        error(`Part ${partNum}: missing or invalid 'pageRange'`);
      if (!partData.pages || !Array.isArray(partData.pages))
        error(`Part ${partNum}: missing or invalid 'pages'`);

      // Verify page count matches
      const expectedPages = partEntry.pageRange[1] - partEntry.pageRange[0] + 1;
      if (partData.pages.length !== expectedPages) {
        error(`Part ${partNum}: Expected ${expectedPages} pages, found ${partData.pages.length}`);
      }

      // Verify page numbering
      for (let i = 0; i < partData.pages.length; i++) {
        const expectedPageNum = partEntry.pageRange[0] + i;
        const actualPageNum = partData.pages[i].pageNum;

        if (actualPageNum !== expectedPageNum) {
          error(
            `Part ${partNum}: Page ${i} has incorrect pageNum (expected ${expectedPageNum}, got ${actualPageNum})`,
          );
        }

        // Check for missing titles
        if (!partData.pages[i].title) {
          warning(`Part ${partNum}: Page ${actualPageNum} missing title`);
        }

        // Check for missing content
        if (!partData.pages[i].translation || partData.pages[i].translation.trim() === '') {
          warning(`Part ${partNum}: Page ${actualPageNum} missing translation`);
        }
      }

      success(`Part ${partNum} valid (${partData.pages.length} pages)`);
    } catch (err) {
      error(`Part ${partNum}: JSON parse error - ${err.message}`);
    }
  }
}

/**
 * Verify rendered images
 */
function verifyImages(manifest) {
  console.log('');
  console.log('🖼️  Verifying rendered images...');

  if (!manifest) {
    error('Cannot verify images without valid manifest');
    return;
  }

  const imagesDir = join(ROOT_DIR, config.output.images);
  const expectedDPI = config.settings.imageDPI;

  // Expected dimensions for A4 at 300 DPI
  // A4 = 210 x 297 mm
  // At 300 DPI: 2480 x 3507 pixels
  const expectedWidth = Math.round((210 / 25.4) * expectedDPI); // ~2480
  const expectedHeight = Math.round((297 / 25.4) * expectedDPI); // ~3507

  let imageCount = 0;
  let totalSize = 0;

  for (let pageNum = 1; pageNum <= manifest.totalPages; pageNum++) {
    const imageName = `page_${String(pageNum).padStart(3, '0')}.png`;
    const imagePath = join(imagesDir, imageName);

    if (!existsSync(imagePath)) {
      error(`Image not found: ${imageName}`);
      continue;
    }

    try {
      const buffer = readFileSync(imagePath);
      const dimensions = imageSize(buffer);
      const stats = statSync(imagePath);

      // Check dimensions (allow 1-2 pixel tolerance for rounding)
      const widthDiff = Math.abs(dimensions.width - expectedWidth);
      const heightDiff = Math.abs(dimensions.height - expectedHeight);

      if (widthDiff > 2 || heightDiff > 2) {
        warning(
          `${imageName}: Unexpected dimensions (${dimensions.width}x${dimensions.height}, expected ${expectedWidth}x${expectedHeight})`,
        );
      }

      imageCount++;
      totalSize += stats.size;
    } catch (err) {
      error(`${imageName}: Error reading image - ${err.message}`);
    }
  }

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  success(
    `${imageCount} images verified (${totalSizeMB} MB total, ${expectedWidth}x${expectedHeight} pixels)`,
  );
}

/**
 * Verify page numbering continuity
 */
function verifyPageContinuity(manifest) {
  console.log('');
  console.log('🔢 Verifying page numbering continuity...');

  if (!manifest) {
    error('Cannot verify page continuity without valid manifest');
    return;
  }

  const parts = manifest.parts.sort((a, b) => parseInt(a.part) - parseInt(b.part));

  let expectedPage = 1;

  for (const part of parts) {
    const [start, end] = part.pageRange;

    if (start !== expectedPage) {
      error(`Part ${part.part}: Page range starts at ${start}, expected ${expectedPage}`);
    }

    expectedPage = end + 1;
  }

  const lastPart = parts[parts.length - 1];
  const actualTotal = lastPart.pageRange[1];

  if (actualTotal !== manifest.totalPages) {
    error(
      `Total pages mismatch: manifest says ${manifest.totalPages}, last page is ${actualTotal}`,
    );
  } else {
    success(`Page numbering continuous (1-${manifest.totalPages})`);
  }
}

/**
 * Run all verifications
 */
async function runVerifications() {
  const manifest = verifyManifest();
  verifyPartFiles(manifest);
  verifyImages(manifest);
  verifyPageContinuity(manifest);

  console.log('');
  console.log('='.repeat(50));
  console.log('📊 Verification Summary:');
  console.log('');

  if (errorCount === 0 && warningCount === 0) {
    console.log('✅ All checks passed! PDF processing output is valid.');
  } else {
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
    if (warningCount > 0) {
      console.log(`⚠️  Warnings: ${warningCount}`);
    }
    console.log('');
    console.log('Please fix the issues above and re-run verification.');
  }

  console.log('');

  // Exit with error code if there are errors
  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run verifications
runVerifications();
