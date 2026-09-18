const fs = require('fs');
const htmlPath = 'D:\\lamia_gnaba_prof_francais\\lami-app-static\\index.html';
let html = fs.readFileSync(htmlPath, 'utf8');
const lines = html.split('\n');

let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) start = i;
  if (start >= 0 && lines[i].trim() === '];') { end = i; break; }
}

console.log(`DOCS: lines ${start+1}-${end+1}`);

let fixed = 0;
for (let i = start + 1; i < end; i++) {
  const line = lines[i].trim();
  // Entry lines start with {id: and end with } (without comma)
  if (line.startsWith('{id:') && line.endsWith('}') && !line.endsWith('},')) {
    lines[i] = lines[i].replace(/\}$/, '},');
    fixed++;
  }
}
console.log(`Added commas to ${fixed} entries`);

fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');
console.log('Written');
