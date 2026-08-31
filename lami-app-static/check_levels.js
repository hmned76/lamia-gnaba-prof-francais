const fs = require('fs');
const html = fs.readFileSync('D:\\lamia_gnaba_prof_francais\\lami-app-static\\index.html', 'utf8');
const lines = html.split('\n');
let s = -1, e = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) s = i;
  if (s >= 0 && lines[i].trim() === '];') { e = i; break; }
}
const block = lines.slice(s, e + 1).join('\n');

// Count by level and cat
const docsByLevelCat = {};
const re = /\{id:\d+,name:'[^']*',type:'[^']*',level:'([^']*)',mod:'[^']*',date:'[^']*',size:'[^']*',cat:'([^']*)',/g;
let m;
while ((m = re.exec(block)) !== null) {
  const level = m[1];
  const cat = m[2];
  if (!docsByLevelCat[level]) docsByLevelCat[level] = {};
  docsByLevelCat[level][cat] = (docsByLevelCat[level][cat] || 0) + 1;
}

console.log('Levels and their categories:');
Object.keys(docsByLevelCat).sort().forEach(level => {
  console.log(`\n${level}:`);
  Object.keys(docsByLevelCat[level]).forEach(cat => {
    console.log(`  ${cat}: ${docsByLevelCat[level][cat]}`);
  });
});
