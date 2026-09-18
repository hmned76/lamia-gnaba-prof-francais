const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const base = 'D:\\lamia_gnaba_prof_francais';

function walkSync(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (!file.name.startsWith('~$') && file.name !== 'node_modules' && file.name !== '.git' && file.name !== 'android' && file.name !== 'www') {
        results = results.concat(walkSync(fullPath, exts));
      }
    } else if (exts.some(ext => file.name.toLowerCase().endsWith(ext))) {
      if (!file.name.startsWith('~$')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function extractDocx(filePath) {
  try {
    const AdmZip = require(path.join(__dirname, 'node_modules', 'adm-zip'));
    const zip = new AdmZip(filePath);
    const entry = zip.getEntry('word/document.xml');
    if (!entry) return '';
    const xml = entry.getData().toString('utf8');
    const matches = xml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const text = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
    return text.replace(/\s+/g, ' ').trim();
  } catch (e) {
    // Fallback: read as zip with built-in
    try {
      const JSZip = require(path.join(__dirname, 'node_modules', 'jszip'));
    } catch {}
    return '';
  }
}

function extractDocFallback(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const text = buf.toString('latin1');
    const matches = text.match(/[^\x00-\x08\x0B\x0C\x0E-\x1F]{4,}/g) || [];
    return matches.join(' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return '';
  }
}

// Check if adm-zip is available
let hasAdmZip = false;
try { require.resolve(path.join(__dirname, 'node_modules', 'adm-zip')); hasAdmZip = true; } catch {}

console.log('adm-zip available:', hasAdmZip);
console.log('Scanning files...');

const files = walkSync(base, ['.docx', '.doc']);
console.log(`Found ${files.length} documents`);

const results = [];
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const name = path.basename(f);
  let content = '';
  
  if (ext === '.docx' && hasAdmZip) {
    content = extractDocx(f);
  }
  
  if (!content) {
    content = extractDocFallback(f);
  }
  
  const safeContent = content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ');
  const safeName = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  results.push({
    name: safeName,
    content: safeContent || 'Document - contenu non extractible',
    ext: ext.replace('.', '').toUpperCase(),
    size: Math.round(fs.statSync(f).size / 1024) + ' KB'
  });
  
  if (results.length % 20 === 0) {
    console.log(`  Progress: ${results.length}/${files.length} - ${name}: ${safeContent.length} chars`);
  }
}

fs.writeFileSync(
  path.join(__dirname, 'doc_contents_full.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

console.log(`\nDone! ${results.length} files saved to doc_contents_full.json`);
const withContent = results.filter(r => r.content.length > 50 && !r.content.includes('contenu non extractible'));
console.log(`With real content: ${withContent.length}`);
