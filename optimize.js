const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  require.resolve('sharp');
} catch (e) {
  console.log("Installing sharp...");
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

async function processImage(inputPath, outputPath, width) {
  console.log(`Processing ${inputPath}...`);
  try {
    await sharp(inputPath)
      .resize({ width: width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`Saved ${outputPath}`);
  } catch (err) {
    console.error(`Failed to process ${inputPath}:`, err);
  }
}

async function run() {
  await processImage('images/hero-bracelet.jpg', 'images/hero-bracelet.webp', 1200);
  await processImage('images/yiannos-workshop.jpg', 'images/yiannos-workshop.webp', 1200);
  await processImage('images/maison/maison-flagship-interior-nicosia-01.jpg', 'images/maison/maison-flagship-interior-nicosia-01.webp', 1000);
  await processImage('images/maison/maison-flagship-facade-nicosia-02.jpg', 'images/maison/maison-flagship-facade-nicosia-02.webp', 1000);
  await processImage('images/heritage/heritage-founders-father-son-01.jpg', 'images/heritage/heritage-founders-father-son-01.webp', 1000);
  
  // Also list other large images to check
  const dir = fs.readdirSync('images');
  for (const file of dir) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const stats = fs.statSync(path.join('images', file));
      if (stats.size > 500000) { // Larger than 500KB
        console.log(`Large image found: ${file} (${Math.round(stats.size/1024)} KB)`);
      }
    }
  }
}
run();
