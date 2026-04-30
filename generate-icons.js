import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = `<svg width="512" height="512" viewBox="0 0 680 680" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="90" width="500" height="500" rx="100" fill="#E8651A"/>
  <rect x="200" y="210" width="130" height="170" rx="6" fill="#1A3A6B"/>
  <rect x="350" y="210" width="130" height="170" rx="6" fill="#1A3A6B"/>
  <rect x="210" y="218" width="110" height="154" rx="4" fill="#D6E4FF"/>
  <rect x="360" y="218" width="110" height="154" rx="4" fill="#D6E4FF"/>
  <line x1="230" y1="248" x2="300" y2="248" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="230" y1="268" x2="300" y2="268" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="230" y1="288" x2="300" y2="288" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="230" y1="308" x2="285" y2="308" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="380" y1="248" x2="450" y2="248" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="380" y1="268" x2="450" y2="268" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="380" y1="288" x2="450" y2="288" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <line x1="380" y1="308" x2="435" y2="308" stroke="#1A3A6B" stroke-width="8" stroke-linecap="round"/>
  <path d="M330 215 Q340 208 350 215 L350 385 Q340 378 330 385 Z" fill="#1A3A6B"/>
  <rect x="190" y="375" width="300" height="14" rx="7" fill="#1A3A6B"/>
  <text x="340" y="460" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#FFF4EE" letter-spacing="1">VocabDaily</text>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(192, 192).png().toFile('public/icon-192.png')
console.log('✅ icon-192.png created')

await sharp(buf).resize(512, 512).png().toFile('public/icon-512.png')
console.log('✅ icon-512.png created')