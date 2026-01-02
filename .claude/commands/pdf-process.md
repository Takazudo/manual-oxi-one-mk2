---
allowed-tools: Bash, Read, Task, TaskOutput
argument-hint:
  - all|split|render|extract|translate|build|manifest
description: >-
  Execute PDF processing pipeline steps. Use 'all' for full pipeline or specify individual step
  (split, render, extract, translate, build, manifest).
---

# PDF Processing Command

Execute individual steps or the full PDF processing pipeline.

## Usage

Most steps can be run directly:

```bash
pnpm run pdf:{{ARGUMENTS}}
```

**Exception: The `translate` step requires special handling** (see below).

## Available Steps

- `all` - Run complete pipeline (split → render → extract → translate → build → manifest)
- `split` - Split PDF into parts (30 pages each)
- `render` - Render pages to PNG images (150 DPI)
- `extract` - Extract text from PDFs
- `translate` - Translate to Japanese using Claude Code subagents ⚠️
- `build` - Build final JSON files
- `manifest` - Create manifest.json

## Translation Step (Special Handling)

The `translate` step uses Claude Code's manual-translator subagents and must be handled by Claude Code directly:

### Steps:

1. Read all `data/extracted/part-*.txt` files
2. For each part file:
   - Spawn a `manual-translator` subagent using the Task tool
   - Pass the extracted text with proper formatting (include page markers "-- N of 30 --")
   - Run multiple translations in parallel (recommended: 4 at a time)
3. Save each translation result to `data/translations-draft/part-*.json` with structure:
   ```json
   {
     "part": "01",
     "pageRange": [1, 30],
     "translation": "translated text with page markers",
     "metadata": {
       "method": "claude-code-subagent",
       "translatedAt": "ISO timestamp"
     }
   }
   ```

### Example Task invocation:

```xml
<invoke name="Task">
  <parameter name="subagent_type">manual-translator</parameter>
  <parameter name="description">Translate part-01 to Japanese</parameter>
  <parameter name="prompt">Translate the following English text from the OXI ONE MKII manual to Japanese. Preserve all page markers exactly as they appear (-- N of 30 --):

[extracted text from part-01.txt]</parameter>
  <parameter name="run_in_background">true</parameter>
</invoke>
```

## Examples

- `/pdf-process split` - Just split the PDF
- `/pdf-process render` - Just render pages to images
- `/pdf-process extract` - Just extract text
- `/pdf-process translate` - Spawn manual-translator subagents to translate all parts
- `/pdf-process build` - Build final JSON files from translation drafts
- `/pdf-process manifest` - Create manifest.json

This will execute the selected step and show progress in the terminal.
