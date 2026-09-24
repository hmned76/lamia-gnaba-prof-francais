const { app, BrowserWindow, Menu, dialog } = require('electron');
const net = require('net');

// Les deux origines possibles du serveur LamiAI :
const LAN_URL = 'http://192.168.100.29:8080';   // maison (wifi local, rapide)
const TS_URL  = 'http://100.104.240.32:8080';   // partout (Tailscale)

let win = null;

function canConnect(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(timeoutMs);
    sock.once('connect', () => { sock.destroy(); resolve(true); });
    sock.once('timeout', () => { sock.destroy(); resolve(false); });
    sock.once('error', () => { sock.destroy(); resolve(false); });
    sock.connect(port, host);
  });
}

function splitUrl(url) {
  const m = url.replace(/\/$/, '').match(/^http:\/\/([^:\/]+)(?::(\d+))?$/);
  return { host: m[1], port: m[2] ? parseInt(m[2], 10) : 80 };
}

async function pickUrl() {
  // essaie la maison d'abord (plus rapide), sinon Tailscale
  for (const url of [LAN_URL, TS_URL]) {
    const { host, port } = splitUrl(url);
    const ok = await canConnect(host, port, 2500);
    if (ok) return url;
  }
  return null;
}

function createWindow(url, offline) {
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'LamiAI',
    autoHideMenuBar: true,
    backgroundColor: '#f4f6fb',
  });
  win.setMenuBarVisibility(false);

  if (offline || !url) {
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(offlinePage()));
  } else {
    win.loadURL(url);
  }
  win.on('closed', () => { win = null; });
  return win;
}

function offlinePage() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>LamiAI - hors ligne</title>
<style>
 body{font-family:Segoe UI,Arial,sans-serif;background:#f4f6fb;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
 .box{background:#fff;border:1px solid #dce3ee;border-radius:14px;padding:40px 46px;max-width:520px;text-align:center}
 h1{color:#1f3a6e;margin-bottom:6px} p{color:#445;line-height:1.5} code{background:#eef;padding:2px 6px;border-radius:4px}
 .btn{display:inline-block;margin-top:14px;background:#1f3a6e;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer;text-decoration:none}
</style></head><body><div class="box">
<h1>LamiAI n'est pas joignable</h1>
<p>Le serveur de la Professeure (le PC principal) est injoignable depuis ce PC.</p>
<p>Vérifie que&nbsp;:<br>
1. Le PC principal est <b>allumé</b><br>
2. <b>Tailscale</b> est lancé et connecté sur ce PC avec le compte de la Prof</p>
<p>Serveurs attendus&nbsp;: <code>192.168.100.29:8080</code> (maison) ou <code>100.104.240.32:8080</code> (partout)</p>
<button class="btn" onclick="location.reload()">Réessayer</button>
</div></body></html>`;
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  const url = await pickUrl();
  createWindow(url, url === null);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(url, url === null); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});