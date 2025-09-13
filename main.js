const { app, BrowserWindow, globalShortcut } = require('electron');

let overlay;
let interactive = false;
const mapURL = 'https://wuthering-waves-map.appsample.com/';

function createOverlay() {
  overlay = new BrowserWindow({
    width: 1200,
    height: 800,
    x: 100,
    y: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true
  });

  overlay.loadURL(mapURL);
  overlay.setIgnoreMouseEvents(true); // click-through par défaut
  overlay.setOpacity(0.6);           // semi-transparent
}

app.whenReady().then(() => {
  createOverlay();

  // --- raccourcis globaux ---
  globalShortcut.register('F2', () => {
    if (!overlay) createOverlay();
    overlay.show();
  });

  globalShortcut.register('F3', () => {
    if (overlay) overlay.hide();
  });

  globalShortcut.register('F4', () => {
    if (!overlay) return;
    interactive = !interactive;
    overlay.setIgnoreMouseEvents(!interactive); // toggle click-through
    overlay.setOpacity(interactive ? 1.0 : 0.6); // opaque si interactif, semi-transparent sinon
    if (interactive) overlay.focus();
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
});
