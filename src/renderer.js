// DOM Elements
const editor = document.getElementById('editor');
const transportBtn = document.getElementById('transport-btn');
const settingsBtn = document.getElementById('settings-btn');
const taskBtn = document.getElementById('task-btn');
const transportModal = document.getElementById('transport-modal');
const taskModal = document.getElementById('task-modal');
const destinationsContainer = document.getElementById('destinations');
const tagsContainer = document.getElementById('tags-container');
const addTimestampCheckbox = document.getElementById('add-timestamp');
const cancelBtn = document.getElementById('cancel-btn');
const confirmTransportBtn = document.getElementById('confirm-transport-btn');
const taskTextInput = document.getElementById('task-text');
const taskDateInput = document.getElementById('task-date');
const taskTimeInput = document.getElementById('task-time');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const confirmTaskBtn = document.getElementById('confirm-task-btn');
const statusEl = document.getElementById('status');

// State
let config = null;
let selectedDestination = null;
let selectedTags = new Set();
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

  // Enable transport button when text is entered
  editor.addEventListener('input', () => {
    transportBtn.disabled = editor.value.trim().length === 0;
  });

  // Focus editor on start
  editor.focus();
}

// Open Transport Modal
transportBtn.addEventListener('click', async () => {
  // Refresh config
  config = await window.api.getConfig();

  // Reset state
  selectedDestination = null;
  selectedTags = new Set();

  // Render destinations
  renderDestinations();

  // Render tags
  renderTags();

  // Set timestamp default
  addTimestampCheckbox.checked = config.addTimestamp;

  // Update confirm button state
  updateConfirmButton();

  // Show modal
  transportModal.classList.remove('hidden');
});

// Render Destinations
function renderDestinations() {
  if (config.destinations.length === 0) {
    destinationsContainer.innerHTML = `
      <div class="no-destinations">
        ${t('noDestinations')}<br>
        <a id="open-settings-link">${t('openSettings')}</a>
      </div>
    `;
    document.getElementById('open-settings-link').addEventListener('click', () => {
      transportModal.classList.add('hidden');
      window.api.openSettings();
    });
    return;
  }

  destinationsContainer.innerHTML = config.destinations.map((dest, index) => `
    <div class="destination-item" data-index="${index}">
      <input type="radio" name="destination" id="dest-${index}">
      <div>
        <div class="destination-name">${dest.name}</div>
        <div class="destination-path">${dest.path}</div>
      </div>
    </div>
  `).join('');

  // Add click handlers
  destinationsContainer.querySelectorAll('.destination-item').forEach(item => {
    item.addEventListener('click', () => {
      // Deselect all
      destinationsContainer.querySelectorAll('.destination-item').forEach(i => {
        i.classList.remove('selected');
        i.querySelector('input').checked = false;
      });

      // Select this one
      item.classList.add('selected');
      item.querySelector('input').checked = true;
      selectedDestination = config.destinations[parseInt(item.dataset.index)];

      updateConfirmButton();
    });
  });
}

// Render Tags
function renderTags() {
  if (config.tags.length === 0) {
    tagsContainer.innerHTML = `<span style="color: var(--secondary-color)">${t('noTags')}</span>`;
    return;
  }

  tagsContainer.innerHTML = config.tags.map(tag => `
    <span class="tag-chip" data-tag="${tag}">${tag}</span>
  `).join('');

  // Add click handlers
  tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;

      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        chip.classList.remove('selected');
      } else {
        selectedTags.add(tag);
        chip.classList.add('selected');
      }
    });
  });
}

// Update confirm button state
function updateConfirmButton() {
  confirmTransportBtn.disabled = !selectedDestination;
}

// Cancel
cancelBtn.addEventListener('click', () => {
  transportModal.classList.add('hidden');
});

// Close modal on backdrop click
transportModal.addEventListener('click', (e) => {
  if (e.target === transportModal) {
    transportModal.classList.add('hidden');
  }
});

// Confirm Transport
confirmTransportBtn.addEventListener('click', async () => {
  if (!selectedDestination) return;

  const text = editor.value.trim();
  if (!text) return;

  // Disable button during transport
  confirmTransportBtn.disabled = true;
  confirmTransportBtn.textContent = t('transporting');

  try {
    const result = await window.api.transport({
      text,
      destination: selectedDestination,
      tags: Array.from(selectedTags),
      addTimestamp: addTimestampCheckbox.checked
    });

    if (result.success) {
      // Clear editor
      editor.value = '';
      transportBtn.disabled = true;

      // Hide modal
      transportModal.classList.add('hidden');

      // Show success message
      showStatus(t('transportSuccess'), 'success');
    } else {
      showStatus(`${t('error')}: ${result.error}`, 'error');
    }
  } catch (error) {
    showStatus(`${t('error')}: ${error.message}`, 'error');
  } finally {
    confirmTransportBtn.disabled = false;
    confirmTransportBtn.textContent = t('transportAction');
  }
});

// Settings
settingsBtn.addEventListener('click', () => {
  window.api.openSettings();
});

// ============ TASK FUNCTIONALITY ============

// Open Task Modal
taskBtn.addEventListener('click', () => {
  // Set default date to today
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  taskDateInput.value = dateStr;
  taskTimeInput.value = '10:00';
  taskTextInput.value = '';

  taskModal.classList.remove('hidden');
  taskTextInput.focus();
});

// Cancel Task
cancelTaskBtn.addEventListener('click', () => {
  taskModal.classList.add('hidden');
});

// Close task modal on backdrop click
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.classList.add('hidden');
  }
});

// Confirm Task - Insert into editor
confirmTaskBtn.addEventListener('click', () => {
  const taskText = taskTextInput.value.trim();
  const taskDate = taskDateInput.value;
  const taskTime = taskTimeInput.value;

  if (!taskText) {
    taskTextInput.focus();
    return;
  }

  // Format: - [ ] Aufgabe (@[[2026-02-01]] 10:00)
  let taskLine = `- [ ] ${taskText}`;

  if (taskDate) {
    taskLine += ` (@[[${taskDate}]]`;
    if (taskTime) {
      taskLine += ` ${taskTime}`;
    }
    taskLine += ')';
  }

  // Insert at cursor position or append
  const cursorPos = editor.selectionStart;
  const textBefore = editor.value.substring(0, cursorPos);
  const textAfter = editor.value.substring(editor.selectionEnd);

  // Add newline if needed
  const needsNewlineBefore = textBefore.length > 0 && !textBefore.endsWith('\n');
  const needsNewlineAfter = textAfter.length > 0 && !textAfter.startsWith('\n');

  const insertion = (needsNewlineBefore ? '\n' : '') + taskLine + (needsNewlineAfter ? '\n' : '');

  editor.value = textBefore + insertion + textAfter;

  // Update cursor position
  const newCursorPos = cursorPos + insertion.length;
  editor.selectionStart = newCursorPos;
  editor.selectionEnd = newCursorPos;

  // Enable transport button
  transportBtn.disabled = editor.value.trim().length === 0;

  // Hide modal and focus editor
  taskModal.classList.add('hidden');
  editor.focus();
});

// Enter key in task text input
taskTextInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    confirmTaskBtn.click();
  }
});

// Show status message
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  setTimeout(() => {
    statusEl.classList.add('hidden');
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    if (!transportModal.classList.contains('hidden')) {
      transportModal.classList.add('hidden');
    }
    if (!taskModal.classList.contains('hidden')) {
      taskModal.classList.add('hidden');
    }
  }

  // Cmd/Ctrl + Enter to transport
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && editor.value.trim()) {
    transportBtn.click();
  }

  // Cmd/Ctrl + , for settings
  if ((e.metaKey || e.ctrlKey) && e.key === ',') {
    e.preventDefault();
    window.api.openSettings();
  }

  // Cmd/Ctrl + T for task
  if ((e.metaKey || e.ctrlKey) && e.key === 't') {
    e.preventDefault();
    taskBtn.click();
  }
});

// Start
init();
