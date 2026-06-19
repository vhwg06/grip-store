const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatchRaw = require('pixelmatch');
const pixelmatch = typeof pixelmatchRaw === 'function' ? pixelmatchRaw : pixelmatchRaw.default;

const expectedPath = "/Users/cynus/Desktop/grip-store/playwright/specs/admin/figma-contract.spec.ts-snapshots/store-settings-chromium-darwin.png";
const actualPath = "/Users/cynus/Desktop/grip-store/playwright/test-results/admin-figma-contract-Figma-ef64a--page-matches-Figma-desktop-chromium/store-settings-actual.png";

const imgExp = PNG.sync.read(fs.readFileSync(expectedPath));
const imgAct = PNG.sync.read(fs.readFileSync(actualPath));

const { width, height } = imgExp;
const diff = new PNG({ width, height });
pixelmatch(imgExp.data, imgAct.data, diff.data, width, height, { threshold: 0.1, includeAA: false });

let sidebarDiffs = 0;
let contentDiffs = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (diff.data[idx] === 255 && diff.data[idx + 1] === 0 && diff.data[idx + 2] === 0) {
      if (x < 256) {
        sidebarDiffs++;
      } else {
        contentDiffs++;
      }
    }
  }
}

console.log(`Total Mismatch: ${sidebarDiffs + contentDiffs} pixels`);
console.log(`Sidebar (x < 256) Mismatch: ${sidebarDiffs} pixels (${(sidebarDiffs / (256 * height) * 100).toFixed(2)}% of sidebar)`);
console.log(`Content (x >= 256) Mismatch: ${contentDiffs} pixels (${(contentDiffs / ((width - 256) * height) * 100).toFixed(2)}% of content)`);
