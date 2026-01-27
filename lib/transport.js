const fs = require('fs');
const path = require('path');

/**
 * Execute transport: save text as markdown file with YAML frontmatter
 * @param {Object} options Transport options
 * @param {string} options.text The text content
 * @param {Object} options.destination Destination { name, path }
 * @param {string[]} options.tags Array of tags
 * @param {boolean} options.addTimestamp Whether to add timestamp
 * @param {string} options.filenameFormat Filename format pattern
 * @returns {Promise<string>} Path to created file
 */
async function execute({ text, destination, tags = [], addTimestamp = true, filenameFormat = '{timestamp} - {title}' }) {
  // Validate inputs
  if (!text || text.trim().length === 0) {
    throw new Error('Text darf nicht leer sein');
  }

  if (!destination || !destination.path) {
    throw new Error('Kein Zielort ausgewählt');
  }

  // Ensure destination directory exists
  if (!fs.existsSync(destination.path)) {
    fs.mkdirSync(destination.path, { recursive: true });
  }

  // Extract title from first line
  const lines = text.split('\n');
  const title = extractTitle(lines[0]);

  // Generate filename with format
  const filename = generateFilename(title, filenameFormat);

  // Build YAML frontmatter
  const frontmatter = buildFrontmatter({ title, tags, addTimestamp });

  // Combine frontmatter with text
  const content = frontmatter + text;

  // Full file path
  const filePath = path.join(destination.path, filename);

  // Check if file already exists
  const finalPath = ensureUniquePath(filePath);

  // Write file
  fs.writeFileSync(finalPath, content, 'utf-8');

  return finalPath;
}

/**
 * Extract and clean title from first line
 * @param {string} firstLine First line of text
 * @returns {string} Cleaned title
 */
function extractTitle(firstLine) {
  if (!firstLine) return 'Unbenannt';

  // Remove markdown heading markers
  let title = firstLine.replace(/^#+\s*/, '');

  // Trim whitespace
  title = title.trim();

  // Limit length
  if (title.length > 100) {
    title = title.substring(0, 100);
  }

  return title || 'Unbenannt';
}

/**
 * Generate timestamp in YYYYMMDDHHMM format
 * @returns {string} Timestamp string
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}`;
}

/**
 * Sanitize string for use in filename
 * @param {string} str String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeForFilename(str) {
  return str
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/[<>:"/\\|?*]/g, '')  // Remove illegal filename characters
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim()
    .substring(0, 80);             // Limit length
}

/**
 * Generate safe filename from title and format
 * @param {string} title Title
 * @param {string} format Filename format pattern
 * @returns {string} Safe filename with .md extension
 */
function generateFilename(title, format = '{timestamp} - {title}') {
  const timestamp = generateTimestamp();
  const safeTitle = sanitizeForFilename(title) || 'Notiz';

  // Replace placeholders in format
  let filename = format
    .replace('{timestamp}', timestamp)
    .replace('{title}', safeTitle);

  // Final cleanup - remove any remaining illegal characters
  filename = filename
    .replace(/[<>:"/\\|?*]/g, '')
    .trim();

  // Ensure filename is not empty
  if (!filename) {
    filename = `${timestamp} - Notiz`;
  }

  return `${filename}.md`;
}

/**
 * Build YAML frontmatter
 * @param {Object} options Frontmatter options
 * @returns {string} YAML frontmatter string
 */
function buildFrontmatter({ title, tags = [], addTimestamp = true }) {
  const lines = ['---'];

  // Title
  lines.push(`title: "${escapeYamlString(title)}"`);

  // Timestamp
  if (addTimestamp) {
    const now = new Date();
    lines.push(`date: ${now.toISOString()}`);
  }

  // Tags
  if (tags.length > 0) {
    lines.push('tags:');
    for (const tag of tags) {
      lines.push(`  - ${tag}`);
    }
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * Escape special characters in YAML string
 * @param {string} str String to escape
 * @returns {string} Escaped string
 */
function escapeYamlString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

/**
 * Ensure file path is unique by appending number if needed
 * @param {string} filePath Original file path
 * @returns {string} Unique file path
 */
function ensureUniquePath(filePath) {
  if (!fs.existsSync(filePath)) {
    return filePath;
  }

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  let counter = 1;
  let newPath;

  do {
    newPath = path.join(dir, `${base}-${counter}${ext}`);
    counter++;
  } while (fs.existsSync(newPath) && counter < 1000);

  return newPath;
}

module.exports = {
  execute,
  extractTitle,
  generateFilename,
  generateTimestamp,
  buildFrontmatter
};
