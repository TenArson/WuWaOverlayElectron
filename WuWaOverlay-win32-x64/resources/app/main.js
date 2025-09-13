const { app, BrowserWindow } = require('electron');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const path = require('path');
const sudoPrompt = require('sudo-prompt');

let overlay;
let interactive = false;
const mapURL = 'https://wuthering-waves-map.appsample.com/';
const pressedKeys = new Set();

// --- Crée l'overlay ---
function createOverlay() {
  overlay = new BrowserWindow({
    width: 1200,
    height: 800,
    x: 100,
    y: 100,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    focusable: true
  });

  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.setFullScreenable(false);

  overlay.loadURL(mapURL);
  overlay.setIgnoreMouseEvents(true);
  overlay.setOpacity(0.6);

  overlay.on('closed', () => {
    overlay = null;
    console.log("Overlay fermé");
  });
}

// --- Gestion clavier via uIOhook ---
function registerHotkeys() {
  uIOhook.on('keydown', (event) => {
    const key = event.keycode;
    if (pressedKeys.has(key)) return;
    pressedKeys.add(key);

    switch (key) {
      case UiohookKey.F2:
        if (!overlay) createOverlay();
        overlay.show();
        console.log('Overlay affiché (F2)');
        break;
      case UiohookKey.F3:
        if (overlay) overlay.hide();
        console.log('Overlay masqué (F3)');
        break;
      case UiohookKey.F4:
        if (!overlay) return;
        interactive = !interactive;
        overlay.setIgnoreMouseEvents(!interactive);
        overlay.setResizable(interactive);
        overlay.setOpacity(interactive ? 1.0 : 0.6);
        if (interactive) overlay.focus();
        console.log(`Overlay mode interactif = ${interactive} (F4)`);
        break;
      case UiohookKey.F5:
        console.log('Fermeture complète via F5');
        app.quit();
        break;
    }
  });

  uIOhook.on('keyup', (event) => pressedKeys.delete(event.keycode));

  uIOhook.start();
  console.log('uIOhook démarré');
}

// --- Élévation admin automatique ---
function launchAsAdmin() {
  if (process.platform !== 'win32') return Promise.resolve(); // uniquement Windows
  const isElevated = process.argv.includes('--elevated');

  // Ne demander l'UAC que pour l'exécutable packagé
  if (app.isPackaged && !isElevated) {
    const execPath = process.execPath;
    const cmd = `"${execPath}" --elevated`;
    return new Promise((resolve, reject) => {
      sudoPrompt.exec(cmd, { name: 'WuWaOverlay' }, (err) => {
        if (err) return reject(err);
        app.exit(0); // quitter l'instance non-elevée
      });
    });
  }
  return Promise.resolve();
}

// --- Démarrage ---
(async () => {
  try {
    await launchAsAdmin();
  } catch (e) {
    console.error('Élévation admin échouée:', e);
  }

  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    if (overlay) {
      if (overlay.isMinimized()) overlay.restore();
      overlay.show();
      overlay.focus();
    }
  });

  app.whenReady().then(() => {
    createOverlay();
    registerHotkeys();
  });

  app.on('will-quit', () => {
    try { uIOhook.stop(); } catch (_) {}
  });
})();
