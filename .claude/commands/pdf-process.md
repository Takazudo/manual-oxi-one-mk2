---
allowed-tools: Bash, Read, Task, TaskOutput
description: >-
  Run the complete PDF processing pipeline to convert the manual PDF into Next.js application data.
  This command executes all steps automatically: split, render, extract, translate, build, and
  manifest.
---

# PDF Processing Command

Run the complete PDF processing pipeline automatically.

## Usage

Simply run:

```
/pdf-process
```

This will execute all pipeline steps in order:

1. **Clean** - Remove all existing generated files (images, data, split PDFs)
2. **Split** - Split PDF into parts (30 pages each)
3. **Render** - Render pages to PNG images (150 DPI)
4. **Extract** - Extract text from PDFs
5. **Translate** - Translate to Japanese using manual-translator subagents
6. **Build** - Build final JSON files
7. **Manifest** - Create manifest.json

The entire process takes approximately 15-30 minutes for a 280-page manual.

**Note:** The pipeline will process any PDF file found in `manual-pdf/` directory, regardless of filename.

**Translation Quality:**

- The manual-translator subagent automatically formats translations with proper paragraph breaks
- Numbered items are separated with blank lines (`\n\n`) for better readability
- Sub-items (I., II., III.) stay with their parent items
- This ensures the Japanese translation is easy to read on the web interface

---

## Internal Steps (For Claude Code Reference Only)

The pipeline consists of the following steps. **Users should not invoke these individually** - they are documented here for Claude Code's internal use only.

### Step 0: Clean (Run via Bash)

**ALWAYS run this first to ensure clean state:**

- `pnpm run pdf:clean` - Remove all generated files (images, extracted text, translations, split PDFs)

This ensures no stale data from previous runs interferes with the new processing.

### Step 1-3: Basic Processing (Run via Bash)

These steps can be run directly using pnpm:

- `pnpm run pdf:split` - Split PDF into parts (30 pages each) - processes first PDF found alphabetically
- `pnpm run pdf:render` - Render pages to PNG images (150 DPI)
- `pnpm run pdf:extract` - Extract text from PDFs

### Step 4: Translation (Special Handling Required)

**IMPORTANT:** The translation step MUST use Claude Code's manual-translator subagents, NOT the script.

**CRITICAL:** Full parts (30 pages) are too large for a single subagent - output gets truncated! Must use chunking.

#### Translation Process (Worker Pool Pattern):

For each part file (e.g., `part-01.txt`):

1. **Parse the extracted text** to identify individual pages using markers `-- N of 30 --`
2. **Create a page queue** in memory (pages 1→30)
3. **Spawn 5 worker subagents** in background
4. **Assign initial pages**: page 1→worker 1, page 2→worker 2, ..., page 5→worker 5
5. **Continuous polling**:
   - Check if any worker completed using TaskOutput (non-blocking)
   - When worker completes: save translation, assign next page from queue
   - Repeat until queue is empty and all workers are done
6. **Combine all page translations** in order (1→30)
7. **Save complete translation** to `data/translations-draft/part-*.json`

#### Page Extraction Logic:

```javascript
// Example: Extract pages from part-01.txt
const text = readFileSync('data/extracted/part-01.txt', 'utf-8');
const pages = [];
const pagePattern = /^-- (\d+) of (\d+) --$/gm;
let matches = [...text.matchAll(pagePattern)];

for (let i = 0; i < matches.length; i++) {
  const pageNum = parseInt(matches[i][1]);
  const startIndex = matches[i].index;
  const endIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
  const pageContent = text.slice(startIndex, endIndex).trim();
  pages.push({ pageNum, content: pageContent });
}
```

#### Worker Pool Translation Logic:

```javascript
const MAX_WORKERS = 5;
const pageQueue = [...pages]; // [page1, page2, ..., page30]
const workers = [];
const results = {};

// Assign initial pages to workers
for (let i = 0; i < MAX_WORKERS && pageQueue.length > 0; i++) {
  const page = pageQueue.shift();
  workers[i] = { taskId: spawnAgent(page), pageNum: page.pageNum };
}

// Continuous polling until all pages are translated
while (workers.some(w => w !== null) || pageQueue.length > 0) {
  for (let i = 0; i < MAX_WORKERS; i++) {
    if (!workers[i]) continue;

    // Check if worker completed (non-blocking)
    const result = checkTaskOutput(workers[i].taskId, { block: false });

    if (result.completed) {
      // Save translation
      results[workers[i].pageNum] = result.output;

      // Assign next page or mark worker as done
      if (pageQueue.length > 0) {
        const nextPage = pageQueue.shift();
        workers[i] = { taskId: spawnAgent(nextPage), pageNum: nextPage.pageNum };
      } else {
        workers[i] = null; // Worker done
      }
    }
  }

  // Small delay to avoid tight loop
  await sleep(100);
}

// Combine results in order
const combinedTranslation = pages.map(p => results[p.pageNum]).join('\n\n');
```

#### Translation Output Structure:

```json
{
  "part": "01",
  "pageRange": [1, 30],
  "translation": "page 1 translated text with marker -- 1 of 30 --\n\npage 2 text...",
  "metadata": {
    "method": "claude-code-subagent-worker-pool",
    "translatedAt": "ISO timestamp",
    "pagesTranslated": 30,
    "maxWorkers": 5
  }
}
```

#### Example Task invocation (per page):

```xml
<invoke name="Task">
  <parameter name="subagent_type">manual-translator</parameter>
  <parameter name="description">Translate page 1/30</parameter>
  <parameter name="prompt">Translate the following single page from the OXI ONE MKII manual to Japanese. Preserve the page marker exactly as it appears:

[single page text with marker -- 1 of 30 --]</parameter>
  <parameter name="run_in_background">true</parameter>
</invoke>
```

**Why worker pool pattern:**

- Full 30-page translations produce output >50KB which gets truncated
- Single-page translations ensure complete output for each page
- 5 concurrent workers maximize throughput without context overload
- Workers stay busy continuously (no waiting for slowest in batch)
- This approach guarantees all pages are fully translated efficiently

### Step 5-6: Final Processing (Run via Bash)

- `pnpm run pdf:build` - Build final JSON files from translation drafts
- `pnpm run pdf:manifest` - Create manifest.json
