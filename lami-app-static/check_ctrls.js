const fs = require('fs');
const html = fs.readFileSync('D:\\lamia_gnaba_prof_francais\\lami-app-static\\index.html', 'utf8');
const lines = html.split('\n');
let s = -1, e = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) s = i;
  if (s >= 0 && lines[i].trim() === '];') { e = i; break; }
}
const block = lines.slice(s, e + 1).join('\n');

// Find all controls and their mods
const re = /\{id:(\d+),name:'([^']*)',type:'[^']*',level:'([^']*)',mod:'([^']*)',date:'[^']*',size:'[^']*',cat:'controle'/g;
let m;
const ctrls = [];
while ((m = re.exec(block)) !== null) {
  ctrls.push({ id: m[1], name: m[2], level: m[3], mod: m[4] });
}

console.log('Total controls:', ctrls.length);
console.log('\nBy module:');
const byMod = {};
ctrls.forEach(c => {
  if (!byMod[c.mod]) byMod[c.mod] = [];
  byMod[c.mod].push(c);
});
Object.keys(byMod).sort().forEach(mod => {
  console.log(`  ${mod}: ${byMod[mod].length} docs`);
  byMod[mod].forEach(c => console.log(`    - ${c.name}`));
});
