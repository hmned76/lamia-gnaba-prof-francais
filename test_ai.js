const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true, args:['--no-sandbox']});
  const page = await browser.newPage();
  console.log('Chargement de la page...');
  await page.goto('http://localhost:8080', {waitUntil:'load', timeout:120000});
  console.log('Page chargée');
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR: ' + e.message); });
  page.on('console', msg => { if(msg.type()==='error') console.log('CONSOLE ERROR: ' + msg.text()); });
  
  // Attendre que le script soit chargé
  await page.waitForFunction(() => typeof startLamiAI === 'function', {timeout:60000});
  console.log('startLamiAI disponible');
  
  // Ouvrir l'AI directement
  await page.evaluate(() => startLamiAI('Lecture','','1ère Année','Scènes de la vie en France'));
  await new Promise(r=>setTimeout(r,2000));
  console.log('AI ouvert, chatBox: ' + await page.evaluate(() => document.getElementById('chatBox')?.innerHTML.length));
  
  // Simuler la saisie et envoyer
  await page.evaluate(() => {
    document.getElementById('aiInput').value = 'Quels sont les thèmes du module Scènes de la vie en France ?';
  });
  await new Promise(r=>setTimeout(r,500));
  
  // Cliquer sur le bouton
  await page.evaluate(() => {
    const btn = document.querySelector('#aiInput ~ button, button');
  });
  
  const input = await page.evaluate(() => { const i=document.getElementById('aiInput'); i.value='Que signifie le mot pair dans le texte ?'; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); });
  console.log('Entrée envoyée');
  await new Promise(r=>setTimeout(r,15000));
  
  console.log('chatBox après envoi (DERNIERS 2000 caractères):');
  const box = await page.evaluate(() => document.getElementById('chatBox')?.innerHTML || 'VIDE');
  console.log(box.substring(box.length-3000));
  
  console.log('ERREURS JS:');
  console.log(errors.join('
') || 'Aucune');
  await browser.close();
})();