import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PUBLIC = join(process.cwd(), 'public')
const BRAND = '#E34F26'

// maskable keeps the glyph inside the safe zone (80% of the canvas)
const glyph = (scale) =>
  `  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path d="M196 168 L120 256 L196 344" fill="none" stroke="#fff" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M316 168 L392 256 L316 344" fill="none" stroke="#fff" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M282 148 L230 364" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>
  </g>`

const svg = ({ size = 512, radius = 112, scale = 1 }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${BRAND}"/>
${glyph(scale)}
</svg>`

const SIZES = [192, 256, 384, 512]
const FAVICON_SIZES = [16, 32, 48]

// ICO is just a small directory followed by image payloads. Modern browsers and
// Windows accept PNG payloads, so no BMP encoder is needed.
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)])
}

async function main() {
  await mkdir(PUBLIC, { recursive: true })

  await writeFile(join(PUBLIC, 'icon.svg'), svg({}), 'utf8')

  for (const size of SIZES) {
    await sharp(Buffer.from(svg({}))).resize(size, size).png().toFile(join(PUBLIC, `icon-${size}x${size}.png`))
  }

  await sharp(Buffer.from(svg({})))
    .resize(180, 180)
    .png()
    .toFile(join(PUBLIC, 'apple-icon.png'))

  await sharp(Buffer.from(svg({ radius: 0, scale: 0.78 })))
    .resize(512, 512)
    .png()
    .toFile(join(PUBLIC, 'icon-maskable-512x512.png'))

  const favicon = await Promise.all(
    FAVICON_SIZES.map(async (size) => ({
      size,
      data: await sharp(Buffer.from(svg({}))).resize(size, size).png().toBuffer(),
    }))
  )
  await writeFile(join(process.cwd(), 'app', 'favicon.ico'), buildIco(favicon))

  console.log(
    `wrote icon.svg + ${SIZES.length} png sizes + apple + maskable + favicon.ico (${FAVICON_SIZES.join('/')})`
  )
}

main()
