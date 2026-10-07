import sharp from 'sharp';

const C = { paper: '#f2f0e9', grid: '#e3e2dc', navy: '#17264a', ink: '#5b6475', orange: '#ff4d1f', white: '#ffffff' };
const S = {
  A: ['#bfe3c8', 'A'],
  P: ['#f4b6cb', 'P'],
  N: ['#b3cbef', 'N'],
  O: ['#dedcd6', 'Off'],
  L: ['#f3e49a', 'AL'],
};
const month = '..AAPPNO OAAPPNN OOAALLL OPPPANO OAAO...'.replace(/ /g, '');

const font = `font-family="Consolas, 'Courier New', monospace"`;
let grid = '';
for (let x = 0; x <= 800; x += 24) grid += `<path d="M${x} 0V600" stroke="${C.grid}"/>`;
for (let y = 0; y <= 600; y += 24) grid += `<path d="M0 ${y}H800" stroke="${C.grid}"/>`;

const px = 72, py = 72, pw = 264, ph = 456;
const cw = 30, chh = 44, gap = 4, gx = px + (pw - (7 * cw + 6 * gap)) / 2, gy = py + 104;
let cells = '';
'SMTWTFS'.split('').forEach((d, i) => {
  cells += `<text x="${gx + i * (cw + gap) + cw / 2}" y="${gy - 10}" ${font} font-size="11" fill="${C.ink}" text-anchor="middle">${d}</text>`;
});
[...month].forEach((k, i) => {
  const x = gx + (i % 7) * (cw + gap), y = gy + Math.floor(i / 7) * (chh + gap);
  if (k === '.') return;
  const [fill, label] = S[k];
  cells += `<rect x="${x}" y="${y}" width="${cw}" height="${chh}" rx="4" fill="${fill}"/>`;
  cells += `<text x="${x + 4}" y="${y + 12}" ${font} font-size="9" fill="${C.ink}">${i - 1}</text>`;
  cells += `<text x="${x + cw / 2}" y="${y + 33}" ${font} font-size="${label.length > 1 ? 10 : 12}" font-weight="700" fill="${C.navy}" text-anchor="middle">${label}</text>`;
});

[['A', 'AM'], ['P', 'PM'], ['N', 'Night'], ['O', 'Off'], ['L', 'Leave']].forEach(([k, name], i) => {
  const x = gx + (i % 3) * 78, y = gy + 5 * (chh + gap) + 28 + Math.floor(i / 3) * 24;
  cells += `<rect x="${x}" y="${y - 10}" width="12" height="12" rx="3" fill="${S[k][0]}"/>`;
  cells += `<text x="${x + 18}" y="${y}" ${font} font-size="11" fill="${C.ink}">${name}</text>`;
});

const bubble = (x, y, w, h, fill, lines, color) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}"/>` +
  lines.map((l, i) => `<text x="${x + 14}" y="${y + 24 + i * 20}" ${font} font-size="13" fill="${color}">${l}</text>`).join('');

const cx = 480, cy = 96, cwid = 264;
const chat =
  `<rect x="${cx}" y="${cy}" width="${cwid}" height="408" rx="20" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>` +
  `<path d="M${cx} ${cy + 48}H${cx + cwid}" stroke="${C.grid}" stroke-width="2"/>` +
  `<circle cx="${cx + 28}" cy="${cy + 24}" r="12" fill="${C.navy}"/>` +
  `<text x="${cx + 48}" y="${cy + 29}" ${font} font-size="14" font-weight="700" fill="${C.navy}">bb-bot</text>` +
  `<rect x="${cx + 120}" y="${cy + 68}" width="128" height="72" rx="10" fill="${C.navy}"/>` +
  `<rect x="${cx + 132}" y="${cy + 80}" width="104" height="48" rx="4" fill="#2c3d66"/>` +
  [0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${cx + 138 + c * 19}" y="${cy + 86 + r * 13}" width="16" height="10" rx="2" fill="${Object.values(S)[(r + c) % 4][0]}"/>`).join('')).join('') +
  bubble(cx + 16, cy + 156, 232, 68, '#eef1f6', ['Added 31 shifts to', 'Google Calendar ✓'], C.navy) +
  bubble(cx + 16, cy + 240, 232, 68, '#eef1f6', ['Daily reminder, before', 'your 13:30 PM shift'], C.navy) +
  `<rect x="${cx + 16}" y="${cy + 320}" width="232" height="36" rx="8" fill="${C.white}" stroke="${C.navy}" stroke-width="2"/>` +
  `<text x="${cx + 132}" y="${cy + 343}" ${font} font-size="13" font-weight="700" fill="${C.navy}" text-anchor="middle">Done</text>` +
  `<text x="${cx + 16}" y="${cy + 384}" ${font} font-size="11" fill="${C.ink}">reminds again until tapped</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="1600" height="1200">
  <rect width="800" height="600" fill="${C.paper}"/>
  ${grid}
  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="28" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>
  <rect x="${px + pw / 2 - 30}" y="${py + 14}" width="60" height="8" rx="4" fill="${C.navy}"/>
  <text x="${px + 24}" y="${py + 64}" ${font} font-size="18" font-weight="700" fill="${C.navy}">March roster</text>
  ${cells}
  <path d="M360 300H452" stroke="${C.orange}" stroke-width="4"/>
  <path d="M444 290L456 300L444 310" fill="none" stroke="${C.orange}" stroke-width="4"/>
  <text x="406" y="284" ${font} font-size="13" font-weight="700" fill="${C.navy}" text-anchor="middle">OCR</text>
  <text x="406" y="328" ${font} font-size="10" fill="${C.ink}" text-anchor="middle">+ colour</text>
  ${chat}
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('originals/bb-bot.png');
console.log('ok');
