// DOM Elements
const closeBtn = document.getElementById('close-btn');

// Destinations
const addDestinationBtn = document.getElementById('add-destination-btn');
const addDestinationForm = document.getElementById('add-destination-form');
const destNameInput = document.getElementById('dest-name');
const destPathInput = document.getElementById('dest-path');
const browseBtn = document.getElementById('browse-btn');
const cancelDestBtn = document.getElementById('cancel-dest-btn');
const saveDestBtn = document.getElementById('save-dest-btn');
const destinationsList = document.getElementById('destinations-list');

// Tags
const addTagBtn = document.getElementById('add-tag-btn');
const addTagForm = document.getElementById('add-tag-form');
const tagNameInput = document.getElementById('tag-name');
const cancelTagBtn = document.getElementById('cancel-tag-btn');
const saveTagBtn = document.getElementById('save-tag-btn');
const tagsList = document.getElementById('tags-list');

// LanguageTool
const languagetoolEnabled = document.getElementById('languagetool-enabled');

// Filename Format
const filenameFormatInput = document.getElementById('filename-format');
const filenamePreview = document.getElementById('filename-preview');

// State
let config = null;
let editingDestinationIndex = null; // Track which destination is being edited
let i18n = null; // Translations

// Apply translations to DOM
function applyTranslations() {
  if (!i18n) return;

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n.translations[key]) {
      el.textContent = i18n.translations[key];
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n.translations[key]) {
      el.placeholder = i18n.translations[key];
    }
  });

  // Titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (i18n.translations[key]) {
      el.title = i18n.translations[key];
    }
  });

  // Update html lang attribute
  document.documentElement.lang = i18n.lang;
}

// Get translation
function t(key) {
  return i18n?.translations?.[key] || key;
}

// Initialize
async function init() {
  // Load translations first
  i18n = await window.api.getTranslations();
  applyTranslations();

  config = await window.api.getConfig();
  renderDestinations();
  renderTags();
  languagetoolEnabled.checked = config.languageTool.enabled;
  filenameFormatInput.value = config.filenameFormat || '{timestamp} - {title}';
  updateFilenamePreview();
}

// Close settings
closeBtn.addEventListener('click', () => {
  window.api.closeSettings();
});

// ============ Destinations ============

function renderDestinations() {
  if (config.destinations.length === 0) {
    destinationsList.innerHTML = `<div class="empty-message">${t('noDestinationsConfigured')}</div>`;
    return;
  }

  destinationsList.innerHTML = config.destinations.map((dest, index) => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-name">${escapeHtml(dest.name)}</div>
        <div class="list-item-path">${escapeHtml(dest.path)}</div>
      </div>
      <div class="list-item-actions">
        <button class="edit-btn" data-index="${index}">${t('edit')}</button>
        <button class="delete-btn" data-index="${index}">${t('remove')}</button>
      </div>
    </div>
  `).join('');

  // Add edit handlers
  destinationsList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      editDestination(index);
    });
  });

  // Add delete handlers
  destinationsList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      config.destinations.splice(index, 1);
      await window.api.saveConfig(config);
      renderDestinations();
    });
  });
}

// Edit destination
function editDestination(index) {
  editingDestinationIndex = index;
  const dest = config.destinations[index];

  destNameInput.value = dest.name;
  destPathInput.value = dest.path;

  // Update button text
  saveDestBtn.textContent = t('update');

  addDestinationForm.classList.add('visible');
  destNameInput.focus();
}

// Show add destination form
addDestinationBtn.addEventListener('click', () => {
  editingDestinationIndex = null;
  destNameInput.value = '';
  destPathInput.value = '';
  saveDestBtn.textContent = t('save');
  addDestinationForm.classList.add('visible');
  destNameInput.focus();
});

// Cancel add destination
cancelDestBtn.addEventListener('click', () => {
  addDestinationForm.classList.remove('visible');
  destNameInput.value = '';
  destPathInput.value = '';
  editingDestinationIndex = null;
  saveDestBtn.textContent = t('save');
});

// Browse for folder
browseBtn.addEventListener('click', async () => {
  const path = await window.api.selectFolder();
  if (path) {
    destPathInput.value = path;
  }
});

// Save destination (add or update)
saveDestBtn.addEventListener('click', async () => {
  const name = destNameInput.value.trim();
  const path = destPathInput.value.trim();

  if (!name || !path) {
    return;
  }

  if (editingDestinationIndex !== null) {
    // Update existing
    config.destinations[editingDestinationIndex] = { name, path };
  } else {
    // Add new
    config.destinations.push({ name, path });
  }

  await window.api.saveConfig(config);

  addDestinationForm.classList.remove('visible');
  destNameInput.value = '';
  destPathInput.value = '';
  editingDestinationIndex = null;
  saveDestBtn.textContent = t('save');

  renderDestinations();
});

// Enter key in destination form
destNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    destPathInput.focus();
  }
});

destPathInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveDestBtn.click();
  }
});

// ============ Tags ============

function renderTags() {
  if (config.tags.length === 0) {
    tagsList.innerHTML = `<span style="color: var(--secondary-color)">${t('noTagsConfigured')}</span>`;
    return;
  }

  tagsList.innerHTML = config.tags.map(tag => `
    <span class="tag-item">
      ${escapeHtml(tag)}
      <span class="remove" data-tag="${escapeHtml(tag)}">&times;</span>
    </span>
  `).join('');

  // Add remove handlers
  tagsList.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tag = btn.dataset.tag;
      config.tags = config.tags.filter(t => t !== tag);
      await window.api.saveConfig(config);
      renderTags();
    });
  });
}

// Show add tag form
addTagBtn.addEventListener('click', () => {
  addTagForm.classList.add('visible');
  tagNameInput.focus();
});

// Cancel add tag
cancelTagBtn.addEventListener('click', () => {
  addTagForm.classList.remove('visible');
  tagNameInput.value = '';
});

// Save tag
saveTagBtn.addEventListener('click', async () => {
  const tag = tagNameInput.value.trim().toLowerCase();

  if (!tag) {
    return;
  }

  if (!config.tags.includes(tag)) {
    config.tags.push(tag);
    await window.api.saveConfig(config);
  }

  addTagForm.classList.remove('visible');
  tagNameInput.value = '';

  renderTags();
});

// Enter key in tag form
tagNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveTagBtn.click();
  }
});

// ============ Filename Format ============

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}`;
}

function updateFilenamePreview() {
  const format = filenameFormatInput.value || '{timestamp} - {title}';
  const preview = format
    .replace('{timestamp}', generateTimestamp())
    .replace('{title}', 'Meine Notiz');
  filenamePreview.textContent = `${preview}.md`;
}

filenameFormatInput.addEventListener('input', () => {
  updateFilenamePreview();
});

filenameFormatInput.addEventListener('change', async () => {
  config.filenameFormat = filenameFormatInput.value.trim() || '{timestamp} - {title}';
  await window.api.saveConfig(config);
});

// ============ LanguageTool ============

languagetoolEnabled.addEventListener('change', async () => {
  config.languageTool.enabled = languagetoolEnabled.checked;
  await window.api.saveConfig(config);
});

// ============ Utilities ============

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.api.closeSettings();
  }
});

// Start
init();
