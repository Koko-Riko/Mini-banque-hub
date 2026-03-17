
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const isDev = process.env.NODE_ENV === 'development';

// Garder une référence globale de l'objet window
// pour éviter que la fenêtre soit fermée automatiquement 
// quand l'objet JavaScript est garbage collected
let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    title: 'Bank of la Gonave',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // En développement, charge l'URL de développement
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Ouvrir les DevTools en mode développement
    mainWindow.webContents.openDevTools();
  } else {
    // En production, charge le build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  Menu.setApplicationMenu(null);

  // Émis lorsque la fenêtre est fermée
  mainWindow.on('closed', () => {
    // Déréférence l'objet window, si votre application supporte
    // plusieurs fenêtres, c'est le moment de stocker les références
    // dans un tableau.
    mainWindow = null;
  });
}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigateur.
app.whenReady().then(() => {
  createWindow();
  
  // Check for updates
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  
  app.on('activate', () => {
    // Sur macOS il est commun de re-créer une fenêtre dans l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitte l'application quand toutes les fenêtres sont fermées, sauf sur macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
