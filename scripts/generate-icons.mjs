/**
 * Генерация PWA иконок из исходного PNG логотипа Umberla
 * Запуск: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { join, dirname } from 'path'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Ищем логотип в public/
const PUBLIC_DIR = join(__dirname, '../public')
const OUTPUT     = join(PUBLIC_DIR, 'icons')

// Находим PNG файл в public (логотип Umberla)
const files = readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.png'))
if (!files.length) {
  console.error('❌ PNG файл не найден в public/')
  process.exit(1)
}
const SOURCE = join(PUBLIC_DIR, files[0])
console.log(`📁 Источник: ${files[0]}`)

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

async function generate() {
  if (!existsSync(OUTPUT)) {
    mkdirSync(OUTPUT, { recursive: true })
  }

  for (const size of SIZES) {
    const outFile = join(OUTPUT, `icon-${size}.png`)
    await sharp(SOURCE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 13, g: 21, b: 32, alpha: 1 }, // #0d1520
      })
      .png()
      .toFile(outFile)
    console.log(`✅ icon-${size}.png`)
  }

  // Apple Touch Icon (180x180)
  await sharp(SOURCE)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 13, g: 21, b: 32, alpha: 1 },
    })
    .png()
    .toFile(join(OUTPUT, 'apple-touch-icon.png'))
  console.log('✅ apple-touch-icon.png')

  // Favicon 32x32
  await sharp(SOURCE)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 13, g: 21, b: 32, alpha: 1 },
    })
    .png()
    .toFile(join(OUTPUT, 'favicon-32.png'))
  console.log('✅ favicon-32.png')

  console.log('\n🎉 Все иконки сгенерированы в public/icons/')
}

generate().catch(console.error)
