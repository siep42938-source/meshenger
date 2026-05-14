/**
 * Генерация PWA иконок из исходного PNG логотипа Umberla
 * Запуск: node scripts/generate-icons.js
 * Требует: npm install sharp --save-dev (в папке meshenger)
 */

const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const SOURCE = path.join(__dirname, '../public/{C13A05FB-1F57-494F-9E79-A722C535E6CF}.png')
const OUTPUT = path.join(__dirname, '../public/icons')

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

async function generate() {
  if (!fs.existsSync(OUTPUT)) {
    fs.mkdirSync(OUTPUT, { recursive: true })
  }

  for (const size of SIZES) {
    const outFile = path.join(OUTPUT, `icon-${size}.png`)
    await sharp(SOURCE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 13, g: 21, b: 32, alpha: 1 }, // #0d1520 — фон приложения
      })
      .png()
      .toFile(outFile)
    console.log(`✅ icon-${size}.png`)
  }

  // Apple Touch Icon (180x180) — специальный для iOS
  await sharp(SOURCE)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 13, g: 21, b: 32, alpha: 1 },
    })
    .png()
    .toFile(path.join(OUTPUT, 'apple-touch-icon.png'))
  console.log('✅ apple-touch-icon.png')

  // Favicon 32x32
  await sharp(SOURCE)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 13, g: 21, b: 32, alpha: 1 },
    })
    .png()
    .toFile(path.join(OUTPUT, 'favicon-32.png'))
  console.log('✅ favicon-32.png')

  console.log('\n🎉 Все иконки сгенерированы в public/icons/')
}

generate().catch(console.error)
