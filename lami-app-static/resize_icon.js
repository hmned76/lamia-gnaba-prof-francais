const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = 'D:/lamia_gnaba_prof_francais/photo_apk.jpg';
const base = 'D:/lamia_gnaba_prof_francais/lami-app-static/android/app/src/main/res';

const sizes = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

(async () => {
  for (const { dir, size } of sizes) {
    const outDir = path.join(base, dir);
    // ic_launcher.png
    await sharp(src)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));
    // ic_launcher_round.png
    await sharp(src)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));
    console.log(`${dir}: ${size}x${size} OK`);
  }
  // Foreground for adaptive icon (108x108 with padding)
  const fgDir = path.join(base, 'drawable-v24');
  await sharp(src)
    .resize(108, 108, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(fgDir, 'ic_launcher_foreground.png'));
  console.log('adaptive foreground: 108x108 OK');
  console.log('Done!');
})();
