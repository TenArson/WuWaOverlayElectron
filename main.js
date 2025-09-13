const { app, BrowserWindow, globalShortcut } = require('electron');

let overlay;
let interactive = false;
const mapURL = 'https://wuthering-waves-map.appsample.com/';

// Empêcher plusieurs instances
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (overlay) {
      if (overlay.isMinimized()) overlay.restore();
      overlay.show();
      overlay.focus();
      console.log("Deuxième instance détectée → on focus l'overlay existant");
    }
  });

  app.whenReady().then(() => {
    createOverlay();

    globalShortcut.register('F2', () => {
      if (!overlay) createOverlay();
      overlay.show();
      console.log("Overlay affiché (F2)");
    });

    globalShortcut.register('F3', () => {
      if (overlay) {
        overlay.hide();
        console.log("Overlay masqué (F3)");
      }
    });

    globalShortcut.register('F4', () => {
      if (!overlay) return;
      interactive = !interactive;
      overlay.setIgnoreMouseEvents(!interactive);
      overlay.setOpacity(interactive ? 1.0 : 0.6);
      if (interactive) overlay.focus();
      console.log(`Overlay mode interactif = ${interactive} (F4)`);
    });

    globalShortcut.register('F5', () => {
      console.log("Fermeture complète via F5");
      app.quit();
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  });
}

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
  overlay.setIgnoreMouseEvents(true);
  overlay.setOpacity(0.6);

  overlay.on('closed', () => {
    console.log("Overlay fermé");
    overlay = null;
  });
}
