const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const contentPath = path.join(__dirname, 'doc_contents.json');

// 1. Read extracted content
const raw = fs.readFileSync(contentPath, 'utf8').replace(/^\uFEFF/, '');
const extracted = JSON.parse(raw);

// Build lookup by filename (normalized)
const contentMap = {};
for (const item of extracted) {
  const key = item.name.toLowerCase().trim();
  if (!contentMap[key] || item.content.length > contentMap[key].length) {
    contentMap[key] = item;
  }
}

console.log(`Extracted content entries: ${extracted.length}`);

// 2. Read index.html
let html = fs.readFileSync(indexPath, 'utf8');

// 3. Find DOCS array using line-based approach
const lines = html.split('\n');
let docsStartLine = -1;
let docsEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) {
    docsStartLine = i;
  }
  if (docsStartLine >= 0 && lines[i].trim() === '];') {
    docsEndLine = i;
    break;
  }
}

if (docsStartLine === -1 || docsEndLine === -1) {
  console.error(`DOCS not found: start=${docsStartLine} end=${docsEndLine}`);
  process.exit(1);
}

console.log(`DOCS spans lines ${docsStartLine + 1} to ${docsEndLine + 1}`);

// 4. Process each entry line
let replaced = 0;
let missed = 0;
let total = 0;
const newLines = [];

for (let i = docsStartLine; i <= docsEndLine; i++) {
  const line = lines[i];
  
  // Match entry lines
  const entryMatch = line.match(/\{id:(\d+),name:'((?:[^'\\]|\\.)*)',type:'([^']*)',level:'((?:[^'\\]|\\.)*)',mod:'((?:[^'\\]|\\.)*)',date:'([^']*)',size:'([^']*)',cat:'([^']*)',content:'((?:[^'\\]|\\.)*)'\}/);
  
  if (entryMatch) {
    const [, id, name, type, level, mod, date, size, cat, oldContent] = entryMatch;
    total++;
    
    const key = name.toLowerCase().trim();
    const ext = type.toLowerCase();
    
    let newContent = oldContent;
    
    if (contentMap[key]) {
      const extracted = contentMap[key];
      if (extracted.content && extracted.content !== 'Document - contenu non extractible' && extracted.content.length > 20) {
        newContent = extracted.content
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (newContent.length > 500) {
          newContent = newContent.substring(0, 500) + '...';
        }
        replaced++;
      }
    }
    
    if (newContent === oldContent && ext !== 'xlsx' && ext !== 'pdf') {
      missed++;
    }
    
    // Rebuild the line with new content
    const indent = line.match(/^(\s*)/)[1];
    const safeLevel = level.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeMod = mod.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    newLines.push(`${indent}{id:${id},name:'${safeName}',type:'${type}',level:'${safeLevel}',mod:'${safeMod}',date:'${date}',size:'${size}',cat:'${cat}',content:'${newContent}'}`);
  } else {
    newLines.push(line);
  }
}

// 5. Reconstruct HTML
const beforeDocs = lines.slice(0, docsStartLine).join('\n');
const afterDocs = lines.slice(docsEndLine + 1).join('\n');
const newHtml = beforeDocs + newLines.join('\n') + '\n' + afterDocs;

fs.writeFileSync(indexPath, newHtml, 'utf8');

console.log(`\nResults:`);
console.log(`  Total entries: ${total}`);
console.log(`  Content replaced with real text: ${replaced}`);
console.log(`  Content missed (no extraction): ${missed}`);
console.log(`  Written to: ${indexPath}`);
