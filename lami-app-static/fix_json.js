const fs = require('fs');
const filePath = 'D:\\lamia_gnaba_prof_francais\\lami-app-static\\doc_contents_full.json';
let raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

// Convert JS-style object notation to proper JSON
// Replace unquoted keys with quoted keys
raw = raw.replace(/\{(\w+):/g, '{"$1":');
// Replace ,key: with ,"key":
raw = raw.replace(/,(\w+):/g, ',"$1":');

fs.writeFileSync(filePath, raw, 'utf8');

// Verify it's valid JSON now
try {
  const data = JSON.parse(raw);
  console.log('JSON valid! Entries:', data.length);
  console.log('Sample:', JSON.stringify(data[0]).substring(0, 200));
} catch(e) {
  console.log('Still invalid:', e.message);
}
