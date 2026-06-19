const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatchRaw = require('pixelmatch');
const pixelmatch = typeof pixelmatchRaw === 'function' ? pixelmatchRaw : pixelmatchRaw.default;

function compare(expectedPath, actualPath, diffOutPath) {
  const imgExp = PNG.sync.read(fs.readFileSync(expectedPath));
  const imgAct = PNG.sync.read(fs.readFileSync(actualPath));
  
  const { width, height } = imgExp;
  console.log(`Expected size: ${width}x${height}`);
  console.log(`Actual size: ${imgAct.width}x${imgAct.height}`);
  
  if (width !== imgAct.width || height !== imgAct.height) {
    console.log("Sizes do not match! Cannot run pixelmatch.");
    return;
  }
  
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(imgExp.data, imgAct.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false
  });
  
  console.log(`Different pixels: ${diffPixels} (${(diffPixels / (width * height) * 100).toFixed(2)}%)`);
  
  if (diffOutPath) {
    fs.writeFileSync(diffOutPath, PNG.sync.write(diff));
    console.log(`Diff saved to ${diffOutPath}`);
  }
  
  // Analyze vertical difference bands
  const rowDiffs = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (diff.data[idx] === 255 && diff.data[idx + 1] === 0 && diff.data[idx + 2] === 0) {
        rowDiffs[y]++;
      }
    }
  }
  
  let inBand = false;
  let bandStart = 0;
  
  console.log("\nMismatch bands (>2% of row pixels differ):");
  for (let y = 0; y < height; y++) {
    const isMismatched = rowDiffs[y] > (width * 0.02);
    if (isMismatched) {
      if (!inBand) {
        inBand = true;
        bandStart = y;
      }
    } else {
      if (inBand) {
        console.log(`- y=${bandStart} to y=${y} (height ${y - bandStart}px): max row mismatch = ${Math.max(...rowDiffs.slice(bandStart, y))} pixels`);
        inBand = false;
      }
    }
  }
  if (inBand) {
    console.log(`- y=${bandStart} to y=${height} (height ${height - bandStart}px): max row mismatch = ${Math.max(...rowDiffs.slice(bandStart, height))} pixels`);
  }
}

if (process.argv.length < 4) {
  console.log("Usage: node compare.js <expected> <actual> [diffOut]");
} else {
  compare(process.argv[2], process.argv[3], process.argv[4]);
}
