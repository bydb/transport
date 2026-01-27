# Transport - Entwicklerdokumentation

## Projektübersicht

Transport ist eine minimalistische Electron-App zum schnellen Erfassen von Notizen mit automatischer Verarbeitung beim "Transport" zu konfigurierbaren Zielorten.

## Architektur

```
transport/
├── main.js                 # Electron Main Process
├── preload.js              # Secure IPC Bridge
├── package.json            # Projektdefinition & Build-Config
├── src/
│   ├── index.html          # Hauptfenster UI
│   ├── styles.css          # Globales Styling (MindGraph-Design)
│   ├── renderer.js         # Hauptfenster Logik
│   ├── settings.html       # Einstellungen UI
│   └── settings.js         # Einstellungen Logik
├── lib/
│   ├── config.js           # Konfigurationsverwaltung
│   ├── transport.js        # Dateiverarbeitung & Speicherung
│   └── languagetool.js     # Grammatikprüfung via API
├── assets/
│   ├── icon.svg            # Quell-Icon (512x512)
│   └── icon.png            # Generiertes PNG (512x512)
└── scripts/
    └── generate-icons.js   # SVG → PNG Konvertierung
```

## Prozess-Architektur

### Main Process (`main.js`)

Der Main Process ist der Einstiegspunkt der Electron-App und hat Zugriff auf Node.js APIs.

**Verantwortlichkeiten:**
- Fenster erstellen und verwalten (Main Window, Settings Window)
- IPC-Handler für Kommunikation mit Renderer
- Zugriff auf Dateisystem via `lib/` Module
- Native Dialoge (Ordnerauswahl)

**IPC-Handler:**

| Handler | Typ | Beschreibung |
|---------|-----|--------------|
| `config:get` | invoke | Konfiguration laden |
| `config:save` | invoke | Konfiguration speichern |
| `settings:open` | on | Einstellungsfenster öffnen |
| `settings:close` | on | Einstellungsfenster schließen |
| `dialog:selectFolder` | invoke | Ordner-Auswahldialog |
| `languagetool:check` | invoke | Grammatikprüfung durchführen |
| `transport:execute` | invoke | Notiz transportieren |

### Preload Script (`preload.js`)

Sichere Brücke zwischen Main und Renderer Process mit Context Isolation.

```javascript
window.api = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  openSettings: () => ipcRenderer.send('settings:open'),
  closeSettings: () => ipcRenderer.send('settings:close'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  checkGrammar: (text) => ipcRenderer.invoke('languagetool:check', text),
  transport: (options) => ipcRenderer.invoke('transport:execute', options)
};
```

### Renderer Process (`src/renderer.js`, `src/settings.js`)

UI-Logik ohne direkten Zugriff auf Node.js APIs. Kommuniziert über `window.api`.

## Module

### `lib/config.js`

Verwaltet die Konfiguration in `~/.config/transport/config.json`.

**Default-Konfiguration:**
```javascript
{
  destinations: [],
  tags: ['idee', 'todo', 'frage', 'wichtig'],
  addTimestamp: true,
  filenameFormat: '{timestamp} - {title}',
  languageTool: {
    enabled: true,
    apiUrl: 'https://api.languagetool.org/v2/check',
    language: 'de-DE'
  }
}
```

**Funktionen:**
- `load()` - Konfiguration laden (mit Default-Merge)
- `save(config)` - Konfiguration speichern
- `addDestination(dest)` - Zielort hinzufügen
- `removeDestination(name)` - Zielort entfernen
- `addTag(tag)` - Tag hinzufügen
- `removeTag(tag)` - Tag entfernen

### `lib/transport.js`

Verarbeitet und speichert Notizen als Markdown-Dateien.

**Hauptfunktion:**
```javascript
execute({ text, destination, tags, addTimestamp, filenameFormat })
```

**Ablauf:**
1. Text validieren (nicht leer)
2. Zielordner prüfen/erstellen
3. Titel aus erster Zeile extrahieren
4. Dateiname generieren (mit Timestamp)
5. YAML-Frontmatter erstellen
6. Datei speichern
7. Bei Namenskonflikt: Suffix anhängen

**Hilfsfunktionen:**
- `extractTitle(line)` - Titel aus erster Zeile (max 100 Zeichen)
- `generateTimestamp()` - YYYYMMDDHHMM Format
- `sanitizeForFilename(str)` - Umlaute und Sonderzeichen ersetzen
- `generateFilename(title, format)` - Sicheren Dateinamen erstellen
- `buildFrontmatter({ title, tags, addTimestamp })` - YAML-Header

**Dateiname-Format:**
- `{timestamp}` → `202601270901` (YYYYMMDDHHMM)
- `{title}` → Erste Zeile (sanitized)

### `lib/languagetool.js`

Grammatik- und Rechtschreibprüfung via LanguageTool Public API.

**Funktionen:**
- `check(text, options)` - Text prüfen und korrigieren

**API-Aufruf:**
```javascript
POST https://api.languagetool.org/v2/check
Content-Type: application/x-www-form-urlencoded

text=<text>&language=de-DE
```

**Rückgabe:**
```javascript
{
  correctedText: "Korrigierter Text",
  corrections: [
    { original: "fehler", corrected: "Fehler", message: "..." }
  ]
}
```

## UI-Komponenten

### Hauptfenster (`src/index.html`)

- **Toolbar**: Transport-Button (Dropdown) + Einstellungen-Button
- **Editor**: Textarea mit Auto-Fokus
- **Transport-Modal**: Zielort, Tags, Zeitstempel-Option

**CSS-Variablen (MindGraph-Design):**
```css
:root {
  --primary-color: #0a84ff;
  --primary-hover: #0077ed;
  --text-color: #1d1d1f;
  --secondary-color: #86868b;
  --border-color: #d2d2d7;
  --bg-color: #f5f5f7;
  --tag-bg: #f0f0f5;
  --error-color: #ff3b30;
  --success-color: #34c759;
  --titlebar-height: 48px;
  --traffic-light-padding: 76px;
}
```

### Einstellungen (`src/settings.html`)

- **Zielorte**: Liste mit Hinzufügen/Bearbeiten/Löschen
- **Tags**: Chip-Liste mit Hinzufügen/Löschen
- **Dateiname**: Format-Eingabe mit Live-Vorschau
- **LanguageTool**: Toggle für Aktivierung

## Build-Prozess

### Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Icons generieren (SVG → PNG)
npm run icons

# App starten
npm start
```

### Production Build

```bash
# macOS (beide Architekturen)
npm run build:mac

# Nur Intel
npm run build:mac-x64

# Nur Apple Silicon
npm run build:mac-arm64

# Universal Binary
npm run build:mac-universal

# Linux
npm run build:linux
```

**Output:** `dist/`
- `Transport-1.0.0.dmg` - Intel Mac
- `Transport-1.0.0-arm64.dmg` - Apple Silicon
- `Transport-1.0.0-mac.zip` / `-arm64-mac.zip`

### Icon-Generierung

Das Script `scripts/generate-icons.js` konvertiert `assets/icon.svg` in verschiedene PNG-Größen:

```bash
npm run icons
```

Generiert: `icon.png`, `icon_16x16.png`, `icon_32x32.png`, ... `icon_1024x1024.png`

## Erweiterungsmöglichkeiten

### Neue Zielort-Typen

Aktuell werden nur lokale Ordner unterstützt. Erweiterung für Cloud-Services:

```javascript
// lib/destinations/
// ├── local.js      (existiert)
// ├── dropbox.js    (neu)
// └── obsidian.js   (neu)

// In transport.js:
const destinations = {
  local: require('./destinations/local'),
  dropbox: require('./destinations/dropbox')
};

async function execute({ destination, ... }) {
  const handler = destinations[destination.type || 'local'];
  return handler.save({ ... });
}
```

### Neue Frontmatter-Felder

In `lib/transport.js` → `buildFrontmatter()`:

```javascript
function buildFrontmatter({ title, tags, addTimestamp, customFields = {} }) {
  const data = { title };

  if (addTimestamp) {
    data.date = new Date().toISOString();
  }

  if (tags.length > 0) {
    data.tags = tags;
  }

  // Custom fields
  Object.assign(data, customFields);

  return `---\n${yaml.stringify(data)}---\n\n`;
}
```

### Tastenkürzel

In `main.js` mit `globalShortcut`:

```javascript
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  // Cmd+Shift+T zum Transportieren
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    mainWindow.webContents.send('shortcut:transport');
  });
});
```

### Lokaler LanguageTool-Server

Für Offline-Nutzung kann ein lokaler LanguageTool-Server verwendet werden:

```bash
# Docker
docker run -p 8081:8010 erikvl87/languagetool

# In config.json:
{
  "languageTool": {
    "apiUrl": "http://localhost:8081/v2/check"
  }
}
```

### Dark Mode

CSS-Variablen für Dark Mode ergänzen:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #f5f5f7;
    --secondary-color: #a1a1a6;
    --bg-color: #1d1d1f;
    --border-color: #424245;
    --tag-bg: #2c2c2e;
  }
}
```

## Debugging

### DevTools öffnen

In `main.js` nach `mainWindow.loadFile()`:

```javascript
mainWindow.webContents.openDevTools();
```

### Logs

```javascript
// Main Process
console.log('Main:', data);

// Renderer Process (sichtbar in DevTools Console)
console.log('Renderer:', data);
```

### Konfiguration zurücksetzen

```bash
rm -rf ~/.config/transport/config.json
```

## Bekannte Einschränkungen

1. **Keine Code-Signierung**: App ist nicht signiert, macOS zeigt Warnung beim ersten Start
2. **LanguageTool Rate Limit**: Public API hat Limits, für intensive Nutzung lokalen Server verwenden
3. **Keine Sync**: Konfiguration ist lokal, keine Cloud-Synchronisation
4. **Keine Auto-Updates**: Updates müssen manuell installiert werden

## Lizenz

MIT License - siehe [LICENSE](LICENSE)
