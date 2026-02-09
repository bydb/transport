// Minimal Markdown parser for preview rendering
// Supports: headings, bold, italic, inline code, lists, checkboxes, links, paragraphs

function renderMarkdown(text) {
  if (!text || !text.trim()) return '';

  // Strip YAML frontmatter
  let content = text.replace(/^---\n[\s\S]*?\n---\n?/, '');

  // Escape HTML entities
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Process inline markdown
  function inline(str) {
    return str
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  const lines = content.split('\n');
  const html = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = esc(raw);

    // Headings
    if (raw.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (raw.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (raw.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    }
    // Task checkboxes
    else if (raw.match(/^- \[[ xX]\] /)) {
      if (!inList) { html.push('<ul>'); inList = true; }
      const checked = raw[3] !== ' ' ? ' checked disabled' : ' disabled';
      html.push(`<li class="task-item"><input type="checkbox"${checked}>${inline(line.slice(6))}</li>`);
    }
    // Unordered list
    else if (raw.startsWith('- ')) {
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    }
    // Empty line
    else if (raw.trim() === '') {
      if (inList) { html.push('</ul>'); inList = false; }
    }
    // Paragraph text
    else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p>${inline(line)}</p>`);
    }
  }

  if (inList) html.push('</ul>');
  return html.join('\n');
}
