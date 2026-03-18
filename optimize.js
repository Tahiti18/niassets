const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log("Installing sharp...");
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

const CONFIG = {
  // Directories to scan
  scanDirs: [
    'images', 
    'earrings', 
    'rings', 
    'bracelets', 
    'necklaces', 
    'pendants', 
    'crosses', 
    'tiaras',
    'ni shops-1',
    'old photos'
  ],
  outputQuality: 60,
  maxSizes: {
    hero: 1200,
    maison: 1000,
    heritage: 1000,
    archive: 800, // Gallery items
    default: 800
  }
};

async function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        fileList = await walkDir(filePath, fileList);
      }
    } else {
      if (/\.(jpg|jpeg|png)$/i.test(file)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);
  const outputPath = path.join(dirName, `${baseName}.webp`);
  
  // Decide width based on folder/name
  let width = CONFIG.maxSizes.default;
  const lowerPath = filePath.toLowerCase();
  
  if (lowerPath.includes('hero-bracelet')) width = CONFIG.maxSizes.hero;
  else if (lowerPath.includes('maison')) width = CONFIG.maxSizes.maison;
  else if (lowerPath.includes('heritage')) width = CONFIG.maxSizes.heritage;
  else if (lowerPath.includes('yiannos-workshop')) width = CONFIG.maxSizes.maison;
  // Archive categories
  else if (['earrings', 'rings', 'bracelets', 'necklaces', 'pendants', 'crosses', 'tiaras'].some(cat => lowerPath.includes(cat))) {
    width = CONFIG.maxSizes.archive;
  }

  console.log(`Optimizing: ${filePath} -> ${outputPath} (Width: ${width})`);
  
  try {
    const result = await sharp(filePath)
      .resize({ 
        width: width, 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: CONFIG.outputQuality })
      .toFile(outputPath);
      
    const oldSize = fs.statSync(filePath).size;
    const newSize = result.size;
    const savings = ((oldSize - newSize) / oldSize * 100).toFixed(1);
    
    console.log(`  Done: ${Math.round(newSize/1024)}KB (Saved ${savings}%)`);
    return { path: filePath, oldSize, newSize };
  } catch (err) {
    console.error(`  Error processing ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log("Starting Full Site Image Optimization...");
  let allImages = [];
  for (const dir of CONFIG.scanDirs) {
    allImages = await walkDir(dir, allImages);
  }
  
  // Also check root for loose JPGs
  const rootFiles = fs.readdirSync('.');
  for (const file of rootFiles) {
    if (/\.(jpg|jpeg|png)$/i.test(file) && fs.statSync(file).isFile()) {
        allImages.push(file);
    }
  }

  console.log(`Found ${allImages.length} images to process.`);
  
  let totalOld = 0;
  let totalNew = 0;
  
  for (const img of allImages) {
    const res = await optimizeImage(img);
    if (res) {
      totalOld += res.oldSize;
      totalNew += res.newSize;
    }
  }
  
  console.log("\n--- FINAL OPTIMIZATION REPORT ---");
  console.log(`Total Original: ${Math.round(totalOld/1024/1024 * 100)/100} MB`);
  console.log(`Total Optimized: ${Math.round(totalNew/1024/1024 * 100)/100} MB`);
  console.log(`Total Savings: ${Math.round((totalOld - totalNew)/1024/1024 * 100)/100} MB (${Math.round((totalOld - totalNew)/totalOld * 100)}%)`);
}

run();
