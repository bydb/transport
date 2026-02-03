// Internationalization (i18n) module

const translations = {
  de: {
    // Main window
    placeholder: 'Erste Zeile = Titel. Einfach lostippen...',
    transport: 'Transport',
    settings: 'Einstellungen',
    addTask: 'Task hinzufügen',

    // Transport modal
    transportTo: 'Transport nach',
    noDestinations: 'Keine Zielorte konfiguriert.',
    openSettings: 'Einstellungen öffnen',
    tags: 'Tags:',
    noTags: 'Keine Tags konfiguriert',
    addTimestamp: 'Zeitstempel hinzufügen',
    cancel: 'Abbrechen',
    transportAction: 'Transportieren',
    transporting: 'Transportiere...',
    transportSuccess: 'Erfolgreich transportiert!',
    error: 'Fehler',

    // Task modal
    taskTitle: 'Task hinzufügen',
    taskLabel: 'Aufgabe',
    taskPlaceholder: 'Was möchtest du erledigen?',
    dateLabel: 'Datum',
    timeLabel: 'Uhrzeit',
    insert: 'Einfügen',

    // Settings
    settingsTitle: 'Einstellungen',
    destinations: 'Zielorte',
    add: '+ Hinzufügen',
    edit: 'Bearbeiten',
    remove: 'Entfernen',
    noDestinationsConfigured: 'Noch keine Zielorte konfiguriert',
    name: 'Name',
    namePlaceholder: 'z.B. Inbox',
    folder: 'Ordner',
    folderPlaceholder: '/Users/...',
    select: 'Auswählen',
    save: 'Speichern',
    update: 'Aktualisieren',
    tagsSection: 'Tags',
    tagName: 'Tag Name',
    tagPlaceholder: 'z.B. projekt',
    noTagsConfigured: 'Noch keine Tags konfiguriert',
    filename: 'Dateiname',
    format: 'Format',
    timestampHelp: '= YYYYMMDDHHMM (z.B. 202601270901)',
    titleHelp: '= Erste Zeile des Textes',
    preview: 'Vorschau',
    grammarCheck: 'Grammatikkorrektur',
    enableLanguageTool: 'LanguageTool aktivieren',
    languageToolDesc: 'Automatische Rechtschreib- und Grammatikprüfung beim Transport'
  },

  en: {
    // Main window
    placeholder: 'First line = title. Just start typing...',
    transport: 'Transport',
    settings: 'Settings',
    addTask: 'Add task',

    // Transport modal
    transportTo: 'Transport to',
    noDestinations: 'No destinations configured.',
    openSettings: 'Open settings',
    tags: 'Tags:',
    noTags: 'No tags configured',
    addTimestamp: 'Add timestamp',
    cancel: 'Cancel',
    transportAction: 'Transport',
    transporting: 'Transporting...',
    transportSuccess: 'Successfully transported!',
    error: 'Error',

    // Task modal
    taskTitle: 'Add task',
    taskLabel: 'Task',
    taskPlaceholder: 'What do you want to do?',
    dateLabel: 'Date',
    timeLabel: 'Time',
    insert: 'Insert',

    // Settings
    settingsTitle: 'Settings',
    destinations: 'Destinations',
    add: '+ Add',
    edit: 'Edit',
    remove: 'Remove',
    noDestinationsConfigured: 'No destinations configured yet',
    name: 'Name',
    namePlaceholder: 'e.g. Inbox',
    folder: 'Folder',
    folderPlaceholder: '/Users/...',
    select: 'Select',
    save: 'Save',
    update: 'Update',
    tagsSection: 'Tags',
    tagName: 'Tag name',
    tagPlaceholder: 'e.g. project',
    noTagsConfigured: 'No tags configured yet',
    filename: 'Filename',
    format: 'Format',
    timestampHelp: '= YYYYMMDDHHMM (e.g. 202601270901)',
    titleHelp: '= First line of text',
    preview: 'Preview',
    grammarCheck: 'Grammar check',
    enableLanguageTool: 'Enable LanguageTool',
    languageToolDesc: 'Automatic spelling and grammar check during transport'
  },

  fr: {
    // Main window
    placeholder: 'Première ligne = titre. Commencez à écrire...',
    transport: 'Transport',
    settings: 'Paramètres',
    addTask: 'Ajouter une tâche',

    // Transport modal
    transportTo: 'Transporter vers',
    noDestinations: 'Aucune destination configurée.',
    openSettings: 'Ouvrir les paramètres',
    tags: 'Tags :',
    noTags: 'Aucun tag configuré',
    addTimestamp: 'Ajouter horodatage',
    cancel: 'Annuler',
    transportAction: 'Transporter',
    transporting: 'Transport en cours...',
    transportSuccess: 'Transporté avec succès !',
    error: 'Erreur',

    // Task modal
    taskTitle: 'Ajouter une tâche',
    taskLabel: 'Tâche',
    taskPlaceholder: 'Que voulez-vous faire ?',
    dateLabel: 'Date',
    timeLabel: 'Heure',
    insert: 'Insérer',

    // Settings
    settingsTitle: 'Paramètres',
    destinations: 'Destinations',
    add: '+ Ajouter',
    edit: 'Modifier',
    remove: 'Supprimer',
    noDestinationsConfigured: 'Aucune destination configurée',
    name: 'Nom',
    namePlaceholder: 'ex. Inbox',
    folder: 'Dossier',
    folderPlaceholder: '/Users/...',
    select: 'Sélectionner',
    save: 'Enregistrer',
    update: 'Mettre à jour',
    tagsSection: 'Tags',
    tagName: 'Nom du tag',
    tagPlaceholder: 'ex. projet',
    noTagsConfigured: 'Aucun tag configuré',
    filename: 'Nom de fichier',
    format: 'Format',
    timestampHelp: '= YYYYMMDDHHMM (ex. 202601270901)',
    titleHelp: '= Première ligne du texte',
    preview: 'Aperçu',
    grammarCheck: 'Correction grammaticale',
    enableLanguageTool: 'Activer LanguageTool',
    languageToolDesc: 'Vérification automatique de l\'orthographe et de la grammaire'
  },

  es: {
    // Main window
    placeholder: 'Primera línea = título. Empieza a escribir...',
    transport: 'Transportar',
    settings: 'Configuración',
    addTask: 'Añadir tarea',

    // Transport modal
    transportTo: 'Transportar a',
    noDestinations: 'No hay destinos configurados.',
    openSettings: 'Abrir configuración',
    tags: 'Etiquetas:',
    noTags: 'No hay etiquetas configuradas',
    addTimestamp: 'Añadir marca de tiempo',
    cancel: 'Cancelar',
    transportAction: 'Transportar',
    transporting: 'Transportando...',
    transportSuccess: '¡Transportado con éxito!',
    error: 'Error',

    // Task modal
    taskTitle: 'Añadir tarea',
    taskLabel: 'Tarea',
    taskPlaceholder: '¿Qué quieres hacer?',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    insert: 'Insertar',

    // Settings
    settingsTitle: 'Configuración',
    destinations: 'Destinos',
    add: '+ Añadir',
    edit: 'Editar',
    remove: 'Eliminar',
    noDestinationsConfigured: 'No hay destinos configurados',
    name: 'Nombre',
    namePlaceholder: 'ej. Inbox',
    folder: 'Carpeta',
    folderPlaceholder: '/Users/...',
    select: 'Seleccionar',
    save: 'Guardar',
    update: 'Actualizar',
    tagsSection: 'Etiquetas',
    tagName: 'Nombre de etiqueta',
    tagPlaceholder: 'ej. proyecto',
    noTagsConfigured: 'No hay etiquetas configuradas',
    filename: 'Nombre de archivo',
    format: 'Formato',
    timestampHelp: '= YYYYMMDDHHMM (ej. 202601270901)',
    titleHelp: '= Primera línea del texto',
    preview: 'Vista previa',
    grammarCheck: 'Corrección gramatical',
    enableLanguageTool: 'Activar LanguageTool',
    languageToolDesc: 'Corrección automática de ortografía y gramática al transportar'
  }
};

// Detect system language and return supported language code
function detectLanguage() {
  const { app } = require('electron');
  const locale = app.getLocale(); // e.g., 'de-DE', 'en-US', 'fr-FR', 'es-ES'
  const lang = locale.split('-')[0]; // Get just the language part

  // Return supported language or default to English
  if (translations[lang]) {
    return lang;
  }
  return 'en';
}

// Get translation for a key
function t(key, lang) {
  const language = lang || detectLanguage();
  return translations[language]?.[key] || translations['en'][key] || key;
}

// Get all translations for a language
function getTranslations(lang) {
  const language = lang || detectLanguage();
  return translations[language] || translations['en'];
}

module.exports = {
  detectLanguage,
  t,
  getTranslations,
  translations
};
