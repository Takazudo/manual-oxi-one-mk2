#!/usr/bin/env node

/**
 * PDF Translation Script
 * Translates extracted text from English to Japanese using Claude API
 *
 * Input: data/extracted/part-*.txt
 * Output: data/translations-draft/part-*.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load configuration
const config = JSON.parse(readFileSync(join(ROOT_DIR, 'pdf-config.json'), 'utf-8'));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TRANSLATION_PROMPT = `You are a professional technical translator specializing in hardware synthesizer manuals.

Translate the following English text from the OXI ONE MKII hardware synthesizer manual into Japanese.

**Translation Guidelines:**
1. **Style**: Use technical documentation style (です・ます調 / desu-masu style)
2. **Technical Terms**: Preserve these in English where appropriate:
   - MIDI, CV, Gate, Sequencer, BPM, LFO, Arpeggiator, etc.
   - Product names: OXI ONE MKII, USB, etc.
3. **Formatting**: Maintain markdown formatting, line breaks, and structure
4. **Accuracy**: Ensure technical accuracy - this is a hardware manual, precision matters
5. **Clarity**: Keep explanations clear and user-friendly for Japanese musicians
6. **Consistency**: Use consistent terminology throughout

**Important:**
- Do NOT add extra explanations or notes
- Do NOT translate brand names or product names
- Keep numbered lists, bullet points, and headers in the same format
- Preserve any code snippets or technical specifications exactly as they are

Please translate the following text:

---

{{TEXT}}

---

Output ONLY the Japanese translation without any preamble or additional notes.`;

async function translateText(text, partNumber, retries = 3) {
  const prompt = TRANSLATION_PROMPT.replace('{{TEXT}}', text);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`   🤖 Sending to Claude API (attempt ${attempt}/${retries})...`);

      const message = await anthropic.messages.create({
        model: config.settings.translationModel,
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const translation = message.content[0].text;

      return {
        translation,
        metadata: {
          model: config.settings.translationModel,
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          translatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`   ⚠️  Attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        throw new Error(
          `Failed to translate part ${partNumber} after ${retries} attempts: ${error.message}`,
        );
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`   ⏳ Waiting ${waitTime / 1000}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

async function translateAllParts() {
  console.log('🌐 PDF Translation Script');
  console.log('='.repeat(50));

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.error('   Please set your API key:');
    console.error('   export ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  const extractedDir = join(ROOT_DIR, config.output.extracted);
  const outputDir = join(ROOT_DIR, config.output.translationsDraft);

  // Check if extracted directory exists
  if (!existsSync(extractedDir)) {
    console.error(`❌ Extracted directory not found: ${extractedDir}`);
    console.error('   Please run pdf:extract first');
    process.exit(1);
  }

  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📁 Input directory: ${extractedDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`🤖 Model: ${config.settings.translationModel}`);
  console.log('');

  // Get all extracted text files
  const textFiles = readdirSync(extractedDir)
    .filter((file) => file.startsWith('part-') && file.endsWith('.txt'))
    .sort();

  if (textFiles.length === 0) {
    console.error(`❌ No extracted text files found in: ${extractedDir}`);
    console.error('   Please run pdf:extract first');
    process.exit(1);
  }

  console.log(`📚 Found ${textFiles.length} extracted text files`);
  console.log('');

  let totalPartsProcessed = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // Process each part
  for (const textFile of textFiles) {
    const textPath = join(extractedDir, textFile);
    const partNumber = textFile.match(/part-(\d+)\.txt/)?.[1];
    const outputFileName = `part-${partNumber}.json`;

    console.log(`📄 Processing ${textFile}...`);

    try {
      // Read extracted text
      const extractedText = readFileSync(textPath, 'utf-8');

      // Extract just the text content (skip metadata header)
      const textStartIndex = extractedText.indexOf('=== EXTRACTED TEXT ===');
      const textContent =
        textStartIndex !== -1
          ? extractedText.substring(textStartIndex).replace('=== EXTRACTED TEXT ===', '').trim()
          : extractedText;

      console.log(`   📏 Text length: ${textContent.length} characters`);

      // Translate
      const result = await translateText(textContent, partNumber, config.settings.maxRetries);

      console.log(`   ✅ Translation completed`);
      console.log(`   📊 Input tokens: ${result.metadata.inputTokens}`);
      console.log(`   📊 Output tokens: ${result.metadata.outputTokens}`);

      // Save to JSON
      const output = {
        part: partNumber,
        originalText: textContent,
        translation: result.translation,
        metadata: result.metadata,
      };

      const outputPath = join(outputDir, outputFileName);
      writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

      console.log(`   💾 Saved: ${outputPath}`);
      console.log('');

      totalPartsProcessed++;
      totalInputTokens += result.metadata.inputTokens;
      totalOutputTokens += result.metadata.outputTokens;
    } catch (error) {
      console.error(`   ❌ Error processing ${textFile}:`, error.message);

      // Save error report to __inbox
      const errorReport = {
        part: partNumber,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      const errorPath = join(ROOT_DIR, '__inbox', `translation-error-part-${partNumber}.json`);
      mkdirSync(join(ROOT_DIR, '__inbox'), { recursive: true });
      writeFileSync(errorPath, JSON.stringify(errorReport, null, 2), 'utf-8');

      console.error(`   📝 Error report saved: ${errorPath}`);
      process.exit(1);
    }
  }

  console.log('='.repeat(50));
  console.log(`✨ Successfully translated ${totalPartsProcessed} parts`);
  console.log(`📊 Total input tokens: ${totalInputTokens.toLocaleString()}`);
  console.log(`📊 Total output tokens: ${totalOutputTokens.toLocaleString()}`);
  console.log(
    `💰 Estimated cost: $${((totalInputTokens * 0.003 + totalOutputTokens * 0.015) / 1000).toFixed(2)} (approximate)`,
  );
  console.log(`📁 Output location: ${outputDir}`);
}

// Run script
translateAllParts().catch((error) => {
  console.error('');
  console.error('❌ Error translating:');
  console.error(error);
  process.exit(1);
});
