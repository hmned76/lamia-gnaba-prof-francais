const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const contentPath = path.join(__dirname, 'doc_contents_full.json');

const extracted = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const contentMap = {};
for (const item of extracted) {
  const key = item.name.toLowerCase().trim();
  if (!contentMap[key] || item.content.length > contentMap[key].content.length) {
    contentMap[key] = item;
  }
}

const catLabels = {
  cours: 'Contenu de cours',
  exercice: 'Exercice',
  controle: 'Devoir de contrôle',
  fiche: 'Fiche pédagogique',
  synthese: 'Devoir de synthèse',
  vocabulaire: 'Fiche de vocabulaire',
  revision: 'Fiche de révision',
  evaluation: 'Évaluation'
};

let html = fs.readFileSync(indexPath, 'utf8');
const lines = html.split('\n');
let docsDeclLine = -1;
let docsEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trimStart().startsWith('const DOCS = [')) { docsDeclLine = i; break; }
}
for (let i = docsDeclLine + 1; i < lines.length; i++) {
  if (lines[i].trim() === '];') { docsEndLine = i; break; }
}

function escapeJS(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

const catNames = {cours:'Cours',controle:'Contrôle',exercice:'Exercice',fiche:'Fiche',synthese:'Synthèse',vocabulaire:'Vocabulaire',revision:'Révision',evaluation:'Évaluation'};

let fullContent = 0;
let placeholderFixed = 0;
let total = 0;
const docEntries = [];

for (let i = docsDeclLine + 1; i < docsEndLine; i++) {
  const line = lines[i];
  const entryMatch = line.match(/\{id:(\d+),name:'((?:[^'\\]|\\.)*)',type:'([^']*)',level:'((?:[^'\\]|\\.)*)',mod:'((?:[^'\\]|\\.)*)',date:'([^']*)',size:'([^']*)',cat:'([^']*)',content:'((?:[^'\\]|\\.)*)'\}/);
  
  if (entryMatch) {
    const [, id, name, type, level, mod, date, size, cat, oldContent] = entryMatch;
    total++;
    const key = name.toLowerCase().trim();
    let newContent = oldContent;
    
    if (contentMap[key] && contentMap[key].content && !contentMap[key].content.includes('contenu non extractible') && contentMap[key].content.length > 20) {
      newContent = escapeJS(contentMap[key].content);
      fullContent++;
    } else {
      const catLabel = catLabels[cat] || catNames[cat] || 'Document';
      const safeLevel = level.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const safeMod = mod.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      newContent = catLabel + ' — ' + safeLevel + ' — ' + safeMod;
      placeholderFixed++;
    }
    
    const safeName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeLevel = level.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeMod = mod.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    docEntries.push(` {id:${id},name:'${safeName}',type:'${type}',level:'${safeLevel}',mod:'${safeMod}',date:'${date}',size:'${size}',cat:'${cat}',content:'${newContent}'},`);
  }
}

const before = lines.slice(0, docsDeclLine).join('\n');
const after = lines.slice(docsEndLine + 1).join('\n');
const newHtml = before + '\nconst DOCS = [\n' + docEntries.join('\n') + '\n];\n' + after;

fs.writeFileSync(indexPath, newHtml, 'utf8');

console.log(`Total: ${total}`);
console.log(`Full content (extracted): ${fullContent}`);
console.log(`Placeholders fixed (category-aware): ${placeholderFixed}`);
