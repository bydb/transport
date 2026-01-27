#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');

async function generateIcons() {
  try {
    const svg = fs.readFileSync(svgPath);

    // Generate 512x512 PNG
    await sharp(svg)
      .resize(512, 512)
      .png()
      .toFile(pngPath);

    console.log('✓ icon.png (512x512) erstellt');

    // Generate different sizes for macOS
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    for (const size of sizes) {
      const outputPath = path.join(__dirname, '..', 'assets', `icon_${size}x${size}.png`);
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ icon_${size}x${size}.png erstellt`);
    }

    console.log('\n✅ Alle Icons erfolgreich generiert!');
  } catch (error) {
    console.error('Fehler:', error.message);
  }
}

generateIcons();
