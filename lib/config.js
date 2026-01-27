const fs = require('fs');
const path = require('path');
const os = require('os');

// Config directory and file path
const CONFIG_DIR = path.join(os.homedir(), '.config', 'transport');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
  destinations: [],
  tags: ['idee', 'todo', 'frage', 'wichtig'],
  addTimestamp: true,
  filenameFormat: '{timestamp} - {title}',  // Format: {timestamp} = YYYYMMDDHHMM, {title} = Erste Zeile
  languageTool: {
    enabled: true,
    apiUrl: 'https://api.languagetool.org/v2/check',
    language: 'de-DE'
  }
};

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load configuration from file
 * @returns {Object} Configuration object
 */
function load() {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    // Create default config file
    save(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);

    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_CONFIG,
      ...config,
      languageTool: {
        ...DEFAULT_CONFIG.languageTool,
        ...(config.languageTool || {})
      }
    };
  } catch (error) {
    console.error('Error loading config:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration to file
 * @param {Object} config Configuration object
 * @returns {boolean} Success status
 */
function save(config) {
  ensureConfigDir();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

/**
 * Add a destination
 * @param {string} name Destination name
 * @param {string} destPath Destination path
 * @returns {Object} Updated config
 */
function addDestination(name, destPath) {
  const config = load();
  config.destinations.push({ name, path: destPath });
  save(config);
  return config;
}

/**
 * Remove a destination by index
 * @param {number} index Destination index
 * @returns {Object} Updated config
 */
function removeDestination(index) {
  const config = load();
  config.destinations.splice(index, 1);
  save(config);
  return config;
}

/**
 * Add a tag
 * @param {string} tag Tag name
 * @returns {Object} Updated config
 */
function addTag(tag) {
  const config = load();
  if (!config.tags.includes(tag)) {
    config.tags.push(tag);
    save(config);
  }
  return config;
}

/**
 * Remove a tag
 * @param {string} tag Tag name
 * @returns {Object} Updated config
 */
function removeTag(tag) {
  const config = load();
  config.tags = config.tags.filter(t => t !== tag);
  save(config);
  return config;
}

module.exports = {
  load,
  save,
  addDestination,
  removeDestination,
  addTag,
  removeTag,
  CONFIG_DIR,
  CONFIG_FILE
};
