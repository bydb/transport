const https = require('https');
const http = require('http');

/**
 * Check text with LanguageTool API
 * @param {string} text Text to check
 * @param {Object} options LanguageTool options
 * @returns {Promise<{correctedText: string, corrections: Array}>}
 */
async function check(text, options = {}) {
  const {
    apiUrl = 'https://api.languagetool.org/v2/check',
    language = 'de-DE'
  } = options;

  if (!text || text.trim().length === 0) {
    return { correctedText: text, corrections: [] };
  }

  try {
    const response = await makeRequest(apiUrl, {
      text,
      language,
      enabledOnly: 'false'
    });

    const data = JSON.parse(response);
    const corrections = [];

    // Apply corrections in reverse order (to preserve offsets)
    let correctedText = text;
    const matches = data.matches || [];

    // Sort by offset descending
    matches.sort((a, b) => b.offset - a.offset);

    for (const match of matches) {
      if (match.replacements && match.replacements.length > 0) {
        const replacement = match.replacements[0].value;
        const start = match.offset;
        const end = start + match.length;

        corrections.push({
          original: correctedText.substring(start, end),
          replacement,
          message: match.message,
          rule: match.rule?.id
        });

        // Apply correction
        correctedText =
          correctedText.substring(0, start) +
          replacement +
          correctedText.substring(end);
      }
    }

    // Reverse corrections to show in reading order
    corrections.reverse();

    return { correctedText, corrections };
  } catch (error) {
    console.error('LanguageTool error:', error);
    // Return original text if check fails
    return { correctedText: text, corrections: [] };
  }
}

/**
 * Make HTTP POST request
 * @param {string} url API URL
 * @param {Object} params Request parameters
 * @returns {Promise<string>} Response body
 */
function makeRequest(url, params) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const postData = new URLSearchParams(params).toString();

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json'
      }
    };

    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

module.exports = {
  check
};
