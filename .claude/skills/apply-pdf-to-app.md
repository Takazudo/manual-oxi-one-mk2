# apply-pdf-to-app

Automate PDF processing workflow for the OXI ONE MKII manual.

## Description

This skill automates the entire PDF processing pipeline to convert a PDF manual into the Next.js application data format. When the user types `/apply-pdf-to-app`, Claude will:

1. Find the PDF file in `/manual-pdf/` directory
2. Ask for user confirmation
3. Run all PDF processing scripts sequentially
4. Report progress and results

## When to Use

Use this skill when:

- A new PDF manual has been added to `/manual-pdf/`
- The PDF manual has been updated and needs reprocessing
- You need to regenerate all images and translations from scratch

## How It Works

The skill executes the following npm scripts in order:

1. `pnpm run pdf:split` - Split PDF into parts (30 pages each)
2. `pnpm run pdf:render` - Render pages to PNG images (150 DPI)
3. `pnpm run pdf:extract` - Extract text from PDFs
4. `pnpm run pdf:translate` - Translate text to Japanese using Claude API
5. `pnpm run pdf:build` - Build final JSON files
6. `pnpm run pdf:manifest` - Create manifest.json

## Requirements

- PDF file must be placed in `/manual-pdf/` directory
- Only one PDF file should exist in the directory
- `ANTHROPIC_API_KEY` environment variable must be set for translation

## Output

The skill generates:

- `/manual-pdf/parts/` - Split PDF parts
- `/public/manual/pages/` - Rendered page images (PNG, 150 DPI)
- `/data/extracted/` - Extracted text files
- `/data/translations-draft/` - Translation drafts
- `/data/translations/` - Final JSON files for Next.js
- `/data/translations/manifest.json` - Manifest file

## Error Handling

If any step fails:

- The process stops immediately
- Error details are displayed to the user
- Error reports are saved to `__inbox/` directory
- The user can fix the issue and resume from the failed step

## Usage Example

```
User: /apply-pdf-to-app

Claude:
🔍 Searching for PDF in manual-pdf/...
📄 Found: manual-pdf/OXI-ONE-MKII-Manual.pdf

Process this PDF? This will:
- Split into parts
- Render 280+ pages to images
- Extract text
- Translate to Japanese (uses Claude API)
- Generate JSON files

Continue? (This may take 15-30 minutes)

User: Yes

Claude:
✅ Starting PDF processing workflow...

[Runs each step and reports progress]

✨ Done! Processed 280 pages
📁 Output: /data/translations/
```

## Notes

- The translation step uses Claude API and incurs costs
- Processing 280 pages may take 15-30 minutes
- Ensure sufficient disk space for images (~100-200MB)
- The skill can be interrupted and resumed from any step
