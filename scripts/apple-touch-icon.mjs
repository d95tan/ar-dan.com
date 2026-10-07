import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <clipPath id="l"><polygon points="0,0 31.5,0 0,31.5"/></clipPath>
    <clipPath id="k"><polygon points="31.5,0 40,0 40,40 0,40 0,31.5"/></clipPath>
    <path id="d" d="M18.6 3.4V28.4M18.6 11.8H11.4A5.4 5.4 0 0 0 6 17.2V20.8A5.4 5.4 0 0 0 11.4 26.2H18.6" fill="none" stroke-width="4.4"/>
  </defs>
  <rect width="32" height="32" fill="#0d1117"/>
  <polygon points="0,0 31.5,0 0,31.5" fill="#f2f0e9"/>
  <use href="#d" stroke="#17264a" clip-path="url(#l)"/>
  <use href="#d" stroke="#f2f0e9" clip-path="url(#k)"/>
  <rect x="22.4" y="24" width="7" height="4.4" fill="#7ee787"/>
</svg>`;

await sharp(Buffer.from(svg), { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('ok');
