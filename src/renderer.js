// DOM Elements
const editor = document.getElementById('editor');
const transportBtn = document.getElementById('transport-btn');
const settingsBtn = document.getElementById('settings-btn');
const transportModal = document.getElementById('transport-modal');
const destinationsContainer = document.getElementById('destinations');
const tagsContainer = document.getElementById('tags-container');
const addTimestampCheckbox = document.getElementById('add-timestamp');
const cancelBtn = document.getElementById('cancel-btn');
const confirmTransportBtn = document.getElementById('confirm-transport-btn');
const statusEl = document.getElementById('status');

// State
let config = null;
let selectedDestination = null;
let selectedTags = new Set();

// Initialize
async function init() {
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
        Keine Zielorte konfiguriert.<br>
        <a id="open-settings-link">Einstellungen öffnen</a>
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
    tagsContainer.innerHTML = '<span style="color: var(--secondary-color)">Keine Tags konfiguriert</span>';
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
  confirmTransportBtn.textContent = 'Transportiere...';

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
      showStatus('Erfolgreich transportiert!', 'success');
    } else {
      showStatus(`Fehler: ${result.error}`, 'error');
    }
  } catch (error) {
    showStatus(`Fehler: ${error.message}`, 'error');
  } finally {
    confirmTransportBtn.disabled = false;
    confirmTransportBtn.textContent = 'Transportieren';
  }
});

// Settings
settingsBtn.addEventListener('click', () => {
  window.api.openSettings();
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
  // Escape to close modal
  if (e.key === 'Escape' && !transportModal.classList.contains('hidden')) {
    transportModal.classList.add('hidden');
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
});

// Start
init();
