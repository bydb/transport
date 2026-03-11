const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const config = require('./lib/config');
const transport = require('./lib/transport');
const languageTool = require('./lib/languagetool');
const i18n = require('./lib/i18n');

// Icon-Pfad ermitteln (funktioniert sowohl in Entwicklung als auch gepackt)
function getIconPath() {
  if (app.isPackaged) {
    // In gepackter App: Icon liegt in resources/assets/
    return path.join(process.resourcesPath, 'assets', 'icon.png');
  }
  // In Entwicklung: Icon liegt im Projektordner
  return path.join(__dirname, 'assets', 'icon.png');
}

let mainWindow;
let settingsWindow;

function createMainWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    minWidth: 400,
    minHeight: 300,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(iconPath);
  }

  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 550,
    height: 820,
    minWidth: 480,
    minHeight: 700,
    parent: mainWindow,
    modal: true,
    show: false,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile('src/settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// App-Name setzen
app.name = 'Transport';

// Linux: WM_CLASS setzen für korrektes Taskbar-Icon
if (process.platform === 'linux') {
  app.setDesktopName('transport.desktop');
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// i18n - Get translations
ipcMain.handle('i18n:getTranslations', async () => {
  const lang = i18n.detectLanguage();
  return {
    lang,
    translations: i18n.getTranslations(lang)
  };
});

// Config
ipcMain.handle('config:get', async () => {
  return config.load();
});

ipcMain.handle('config:save', async (event, newConfig) => {
  return config.save(newConfig);
});

// Settings Window
ipcMain.on('settings:open', () => {
  createSettingsWindow();
});

ipcMain.on('settings:close', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

// Folder Picker
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(settingsWindow || mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// LanguageTool
ipcMain.handle('languagetool:check', async (event, text) => {
  const cfg = config.load();
  if (!cfg.languageTool.enabled) {
    return { correctedText: text, corrections: [] };
  }
  return languageTool.check(text, cfg.languageTool);
});

// Transport
ipcMain.handle('transport:execute', async (event, { text, destination, tags, addTimestamp, category }) => {
  try {
    const cfg = config.load();

    // Grammatikkorrektur wenn aktiviert
    let finalText = text;
    if (cfg.languageTool.enabled) {
      const result = await languageTool.check(text, cfg.languageTool);
      finalText = result.correctedText;
    }

    // Transport ausführen
    const filePath = await transport.execute({
      text: finalText,
      destination,
      tags,
      addTimestamp,
      filenameFormat: cfg.filenameFormat || '{timestamp} - {title}',
      category: category || '🟢'
    });

    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
