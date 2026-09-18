// ============================================================
//  SCRIPT MESSENGER — téléchargement des fichiers .docx / .doc / .pdf
// ============================================================
//  MODE D'EMPLOI :
//   1. Ouvrir la conversation dans Chrome
//   2. Appuyer sur F12  ->  onglet "Console"
//   3. Si Chrome demande : taper  allow pasting  puis Entrée
//   4. Sélectionner TOUT ce fichier (Ctrl+A / Ctrl+C) et coller (Ctrl+V)
//   5. Appuyer sur Entrée
//
//  POUR REPARTIR DE ZERO (oublier les fichiers déjà vus), coller :
//     Object.keys(localStorage).filter(k=>k.startsWith('hermes_dl_v2')).forEach(k=>localStorage.removeItem(k)); 'ok'
// ============================================================

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  document.getElementById('hermes-panneau')?.remove();
  const P = document.createElement('div');
  P.id = 'hermes-panneau';
  P.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#fff;color:#000;padding:20px;overflow:auto;font:13px/1.5 monospace;white-space:pre-wrap;';
  document.body.appendChild(P);

  const CLE = 'hermes_dl_v2_' + location.pathname;   // memoire propre a CHAQUE conversation
  const vus = new Set(JSON.parse(localStorage.getItem(CLE) || '[]'));
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify([...vus])); } catch (e) {} };

  const journal = [];
  let etapes = 0;
  const RX = /\.(docx|doc|pdf)\b/i;
  const BTN = '[aria-label*="élécharg"], [aria-label*="ownload"], a[download]';

  const cont = () => {
    const main = document.querySelector('div[role="main"]') || document.body;
    const c = [...main.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 80);
    c.sort((a, b) => b.scrollHeight - a.scrollHeight);
    return c[0] || null;
  };

  const survoler = el => ['pointerover', 'mouseover', 'mouseenter', 'mousemove'].forEach(t => {
    try { el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window })); } catch (e) {}
  });

  const escape = () => {
    try {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', keyCode: 27, bubbles: true }));
    } catch (e) {}
  };

  const traiter = async () => {
    for (const el of [...document.querySelectorAll('*')]) {
      if (el.children.length > 0) continue;
      const t = (el.textContent || '').trim();
      if (!t || t.length > 250 || !RX.test(t)) continue;

      const m = t.match(RX);
      const i = t.search(RX);
      const nom = t.slice(0, i + m[0].length).trim();
      const cle = nom.slice(-60).replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (!cle || vus.has(cle)) continue;

      let carte = el;
      for (let k = 0; k < 8 && carte; k++) {
        const r = carte.getAttribute && carte.getAttribute('role');
        if (r === 'button' || carte.tagName === 'A' || (carte.getAttribute && carte.getAttribute('tabindex'))) break;
        carte = carte.parentElement;
      }
      if (!carte || carte === document.body) continue;

      vus.add(cle);
      sauver();
      journal.push(nom.slice(0, 95));

      survoler(carte);
      await sleep(400);

      const b = (carte.parentElement || carte).querySelector(BTN);
      if (b) { b.click(); await sleep(700); continue; }

      carte.click();
      await sleep(1100);

      const dlg = document.querySelector('[role="dialog"]');
      if (dlg) {
        const b2 = dlg.querySelector(BTN);
        if (b2) { b2.click(); await sleep(900); }
        escape();
        await sleep(700);
      }
    }
  };

  await traiter();

  for (let i = 0; i < 900; i++) {
    const c = cont();                 // relocalisé à CHAQUE étape
    if (!c) break;
    c.scrollTop = Math.max(0, c.scrollTop - c.clientHeight * 0.8);
    await sleep(800);
    etapes++;
    await traiter();
    if (i % 3 === 0) {
      P.textContent = 'FICHIERS : ' + vus.size + '\nETAPES : ' + etapes + '\n\nDerniers :\n' +
        journal.slice(-12).map(j => '  ' + j).join('\n') + '\n\n(ne fermez pas cette fenetre)';
    }
  }

  sauver();
  P.textContent = '===== TERMINE =====\n\nFICHIERS TRAITES : ' + vus.size +
    '\n\n' + journal.map(j => '  ' + j).join('\n');
})();
