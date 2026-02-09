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
const preview = document.getElementById('preview');
const previewBtn = document.getElementById('preview-btn');

// State
let config = null;
let selectedDestination = null;
let selectedTags = new Set();
let previewVisible = false;
let i18n = null; // Translations

// Toggle Markdown preview
function togglePreview() {
  previewVisible = !previewVisible;

  if (previewVisible) {
    preview.innerHTML = renderMarkdown(editor.value);
    editor.style.display = 'none';
    preview.classList.remove('hidden');
    previewBtn.classList.add('active');
  } else {
    editor.style.display = '';
    preview.classList.add('hidden');
    previewBtn.classList.remove('active');
    editor.focus();
  }
}

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
      if (previewVisible) togglePreview();

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

// Preview toggle
previewBtn.addEventListener('click', togglePreview);

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

  // Exit preview if active
  if (previewVisible) togglePreview();

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

// ============ FORMAT CONTEXT MENU ============

const formatMenu = document.getElementById('format-menu');

const svgIcon = (paths) =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const formatIcons = {
  cut: svgIcon('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>'),
  copy: svgIcon('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  paste: svgIcon('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'),
  bold: svgIcon('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>'),
  italic: svgIcon('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  code: svgIcon('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  strikethrough: svgIcon('<line x1="4" y1="12" x2="20" y2="12"/><path d="M16 4c-1.5 0-3 .5-3 2 0 3 6 3 6 6 0 1.5-1.5 2-3 2"/><path d="M8 20c1.5 0 3-.5 3-2 0-3-6-3-6-6 0-1.5 1.5-2 3-2"/>'),
  link: svgIcon('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  heading: svgIcon('<path d="M4 4v16"/><path d="M20 4v16"/><path d="M4 12h16"/>'),
  quote: svgIcon('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/>'),
  task: svgIcon('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 12l2 2 4-4"/>'),
  list: svgIcon('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
};

function getFormatOptions() {
  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? '⌘' : 'Ctrl+';
  return [
    { type: 'cut', label: t('formatCut'), icon: formatIcons.cut, shortcut: `${mod}X` },
    { type: 'copy', label: t('formatCopy'), icon: formatIcons.copy, shortcut: `${mod}C` },
    { type: 'paste', label: t('formatPaste'), icon: formatIcons.paste, shortcut: `${mod}V` },
    { type: 'divider' },
    { type: 'bold', label: t('formatBold'), icon: formatIcons.bold, shortcut: `${mod}B` },
    { type: 'italic', label: t('formatItalic'), icon: formatIcons.italic, shortcut: `${mod}I` },
    { type: 'code', label: t('formatCode'), icon: formatIcons.code, shortcut: '' },
    { type: 'strikethrough', label: t('formatStrikethrough'), icon: formatIcons.strikethrough, shortcut: '' },
    { type: 'link', label: t('formatLink'), icon: formatIcons.link, shortcut: '' },
    { type: 'divider' },
    { type: 'heading1', label: t('formatH1'), icon: formatIcons.heading, shortcut: '' },
    { type: 'heading2', label: t('formatH2'), icon: formatIcons.heading, shortcut: '' },
    { type: 'heading3', label: t('formatH3'), icon: formatIcons.heading, shortcut: '' },
    { type: 'divider' },
    { type: 'quote', label: t('formatQuote'), icon: formatIcons.quote, shortcut: '' },
    { type: 'list', label: t('formatList'), icon: formatIcons.list, shortcut: '' },
    { type: 'task', label: t('formatTask'), icon: formatIcons.task, shortcut: '' },
  ];
}

function showFormatMenu(x, y) {
  const options = getFormatOptions();
  formatMenu.innerHTML = options.map(opt => {
    if (opt.type === 'divider') return '<div class="format-menu-divider"></div>';
    return `<button class="format-menu-item" data-format="${opt.type}">
      <span class="format-menu-icon">${opt.icon}</span>
      <span class="format-menu-label">${opt.label}</span>
      ${opt.shortcut ? `<span class="format-menu-shortcut">${opt.shortcut}</span>` : ''}
    </button>`;
  }).join('');

  formatMenu.style.left = x + 'px';
  formatMenu.style.top = y + 'px';
  formatMenu.classList.remove('hidden');

  // Adjust position to stay within viewport
  requestAnimationFrame(() => {
    const rect = formatMenu.getBoundingClientRect();
    const pad = 8;
    if (rect.right > window.innerWidth - pad) {
      formatMenu.style.left = Math.max(pad, window.innerWidth - rect.width - pad) + 'px';
    }
    if (rect.bottom > window.innerHeight - pad) {
      formatMenu.style.top = Math.max(pad, window.innerHeight - rect.height - pad) + 'px';
    }
  });

  // Add click handlers
  formatMenu.querySelectorAll('.format-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      applyFormat(item.dataset.format);
      closeFormatMenu();
    });
  });
}

function closeFormatMenu() {
  formatMenu.classList.add('hidden');
}

function applyFormat(type) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);
  const before = editor.value.substring(0, start);
  const after = editor.value.substring(end);

  let replacement = selected;
  let cursorOffset = 0;

  switch (type) {
    case 'cut':
      document.execCommand('cut');
      return;
    case 'copy':
      document.execCommand('copy');
      return;
    case 'paste':
      document.execCommand('paste');
      return;
    case 'bold':
      replacement = `**${selected || t('formatBoldText')}**`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `*${selected || t('formatItalicText')}*`;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'code':
      replacement = `\`${selected || t('formatCodeText')}\``;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'strikethrough':
      replacement = `~~${selected || t('formatStrikethroughText')}~~`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'link':
      replacement = `[${selected || t('formatLinkLabel')}](url)`;
      cursorOffset = selected ? replacement.length - 4 : 1;
      break;
    case 'heading1':
      replacement = getLinePrefix(before, selected, '# ');
      break;
    case 'heading2':
      replacement = getLinePrefix(before, selected, '## ');
      break;
    case 'heading3':
      replacement = getLinePrefix(before, selected, '### ');
      break;
    case 'quote':
      replacement = getLinePrefix(before, selected, '> ');
      break;
    case 'list':
      replacement = getLinePrefix(before, selected, '- ');
      break;
    case 'task':
      replacement = getLinePrefix(before, selected, '- [ ] ');
      break;
  }

  // For line-prefix types, handle differently
  if (['heading1', 'heading2', 'heading3', 'quote', 'list', 'task'].includes(type)) {
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineContent = before.substring(lineStart) + selected;
    const beforeLine = before.substring(0, lineStart);
    editor.value = beforeLine + replacement + after;
    const newPos = beforeLine.length + replacement.length;
    editor.selectionStart = newPos;
    editor.selectionEnd = newPos;
  } else if (['cut', 'copy', 'paste'].includes(type)) {
    // Already handled above
    return;
  } else {
    editor.value = before + replacement + after;
    if (selected) {
      editor.selectionStart = start;
      editor.selectionEnd = start + replacement.length;
    } else {
      const pos = start + cursorOffset;
      editor.selectionStart = pos;
      editor.selectionEnd = pos + (replacement.length - cursorOffset * 2);
    }
  }

  transportBtn.disabled = editor.value.trim().length === 0;
  editor.focus();
}

// Get line content with prefix for block-level formatting
function getLinePrefix(before, selected, prefix) {
  const lineStart = before.lastIndexOf('\n') + 1;
  const currentLineStart = before.substring(lineStart);
  return prefix + currentLineStart + selected;
}

// Context menu on right-click
editor.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showFormatMenu(e.clientX, e.clientY);
});

// Close format menu on click outside
document.addEventListener('mousedown', (e) => {
  if (!formatMenu.contains(e.target) && !formatMenu.classList.contains('hidden')) {
    closeFormatMenu();
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
  // Escape to close modals and format menu
  if (e.key === 'Escape') {
    if (!formatMenu.classList.contains('hidden')) {
      closeFormatMenu();
    }
    if (!transportModal.classList.contains('hidden')) {
      transportModal.classList.add('hidden');
    }
    if (!taskModal.classList.contains('hidden')) {
      taskModal.classList.add('hidden');
    }
  }

  // Cmd/Ctrl + B for bold
  if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
    e.preventDefault();
    applyFormat('bold');
  }

  // Cmd/Ctrl + I for italic
  if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
    e.preventDefault();
    applyFormat('italic');
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

  // Cmd/Ctrl + P for preview toggle
  if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
    e.preventDefault();
    togglePreview();
  }
});

// Start
init();
