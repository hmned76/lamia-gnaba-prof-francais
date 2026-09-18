const fs = require('fs');
const html = fs.readFileSync('D:\\lamia_gnaba_prof_francais\\lami-app-static\\index.html', 'utf8');
const lines = html.split('\n');
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) start = i;
  if (start >= 0 && lines[i].trim() === '];') { end = i; break; }
}
const block = lines.slice(start, end + 1).join('\n');
const testCode = block + '\nconsole.log("OK", DOCS.length);\n';
fs.writeFileSync('D:\\lamia_gnaba_prof_francais\\lami-app-static\\test_syntax.js', testCode, 'utf8');
console.log('Written test file');
