// Illustrations for the bb-bot gallery, in the same style as scripts/bb-cover.mjs. Writes to originals/bb-bot/;
// run `npm run images` afterwards. Shift names and times are generic examples, not a real roster.
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const C = { paper: '#f2f0e9', grid: '#e3e2dc', navy: '#17264a', ink: '#5b6475', orange: '#ff4d1f', white: '#ffffff', sleep: '#dfe4ee' };
const S = { A: '#bfe3c8', P: '#f4b6cb', N: '#b3cbef', O: '#dedcd6', L: '#f3e49a' };
const F = `font-family="Consolas, 'Courier New', monospace"`;

const t = (x, y, s, { size = 13, weight = 400, fill = C.navy, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" ${F} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const box = (x, y, w, h, { fill = C.white, stroke = C.navy, sw = 2.5, rx = 12, dash = '' } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const arrow = (x1, y1, x2, y2, color = C.orange) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
  const p = (d) => `${x2 - h * Math.cos(a + d)},${y2 - h * Math.sin(a + d)}`;
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="3"/><path d="M${p(-0.5)}L${x2} ${y2}L${p(0.5)}" fill="none" stroke="${color}" stroke-width="3"/>`;
};
const frame = (title, body) => {
  let grid = '';
  for (let x = 0; x <= 800; x += 24) grid += `<path d="M${x} 0V600" stroke="${C.grid}"/>`;
  for (let y = 0; y <= 600; y += 24) grid += `<path d="M0 ${y}H800" stroke="${C.grid}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="1600" height="1200">
    <rect width="800" height="600" fill="${C.paper}"/>${grid}
    ${t(48, 64, title, { size: 22, weight: 700 })}
    ${body}</svg>`;
};

// 1. Reading a roster
function ocr() {
  // Panel A: roster with detected grid
  let a = box(48, 120, 216, 320, { rx: 18 }) + t(64, 150, 'March roster', { size: 13, weight: 700 });
  const keys = 'AAPPNOOAAPPNNOOAALLLOPPPANOOAAO';
  for (let i = 0; i < 30; i++) {
    const x = 62 + (i % 6) * 32, y = 170 + Math.floor(i / 6) * 50;
    a += `<rect x="${x}" y="${y}" width="28" height="44" rx="3" fill="${S[keys[i]]}"/>`;
  }
  for (let c = 0; c <= 6; c++) a += `<path d="M${60 + c * 32} 166V422" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  for (let r = 0; r <= 5; r++) a += `<path d="M60 ${166 + r * 50}H252" stroke="${C.orange}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  a += `<rect x="126" y="216" width="28" height="44" rx="3" fill="none" stroke="${C.navy}" stroke-width="3"/>`;
  a += t(48, 472, '1 · Find the grid', { size: 15, weight: 700 }) + t(48, 494, 'Calibrated per phone layout', { size: 12, fill: C.ink });

  // Panel B: read one cell
  let b = box(296, 120, 216, 320, { rx: 18 });
  b += `<rect x="352" y="140" width="104" height="128" rx="8" fill="${S.P}"/>` + t(366, 162, '10', { size: 14, fill: C.ink });
  b += t(404, 236, 'P1', { size: 40, weight: 700, anchor: 'middle' });
  b += t(316, 304, 'raw     "PI"', { size: 13 }) + t(316, 330, 'allowed A P N 0-9', { size: 13, fill: C.ink });
  b += t(316, 356, 'match   P1', { size: 13, weight: 700 }) + t(316, 382, 'shift   13:30–21:30', { size: 13 });
  b += `<path d="M316 400H492" stroke="${C.grid}" stroke-width="2"/>` + t(316, 424, '✓ known code', { size: 13, weight: 700, fill: '#2f7d46' });
  b += t(296, 472, '2 · Read each cell', { size: 15, weight: 700 }) + t(296, 494, 'OCR, whitelist, fuzzy match', { size: 12, fill: C.ink });

  // Panel C: colour fallback
  let c = box(544, 120, 216, 320, { rx: 18 });
  c += `<rect x="600" y="140" width="104" height="128" rx="8" fill="${S.N}"/>` + t(614, 162, '12', { size: 14, fill: C.ink });
  c += `<path d="M622 222 q10 -14 20 0 t20 0 t20 0" fill="none" stroke="${C.navy}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
  c += t(564, 304, 'raw     "~~~"', { size: 13 }) + t(564, 330, 'match   none', { size: 13, fill: C.ink });
  c += `<rect x="564" y="344" width="16" height="16" rx="3" fill="${S.N}" stroke="${C.navy}"/>` + t(588, 357, 'colour  blue', { size: 13 });
  c += t(564, 382, 'shift   Night', { size: 13, weight: 700 });
  c += `<path d="M564 400H740" stroke="${C.grid}" stroke-width="2"/>` + t(564, 424, '✓ by colour', { size: 13, weight: 700, fill: '#2f7d46' });
  c += t(544, 472, '3 · Fall back to colour', { size: 15, weight: 700 }) + t(544, 494, 'When the text is unreadable', { size: 12, fill: C.ink });

  return frame('How a roster is read', a + b + c + arrow(268, 280, 290, 280) + arrow(516, 280, 538, 280) +
    t(48, 548, 'Shift codes, times and colours live in one YAML file.', { size: 13, fill: C.ink }));
}

// 2. Synced week
function calendar() {
  const x0 = 104, colW = 92, top = 148, hourH = 17;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let g = box(48, 92, 704, 480, { rx: 16 });
  days.forEach((d, i) => {
    g += t(x0 + i * colW + colW / 2, 116, d, { size: 13, weight: 700, anchor: 'middle' });
    if (i) g += `<path d="M${x0 + i * colW} 104V560" stroke="${C.grid}" stroke-width="1.5"/>`;
  });
  g += `<path d="M64 128H744" stroke="${C.grid}" stroke-width="1.5"/>`;
  for (let h = 0; h <= 24; h += 4) {
    const y = top + h * hourH;
    g += t(92, y + 4, `${String(h).padStart(2, '0')}:00`, { size: 10, fill: C.ink, anchor: 'end' });
    g += `<path d="M${x0} ${y}H744" stroke="${C.grid}"/>`;
  }
  const ev = (day, from, to, fill, label, sub = '') => {
    const x = x0 + day * colW + 4, y = top + from * hourH, h = (to - from) * hourH;
    return `<rect x="${x}" y="${y}" width="${colW - 8}" height="${h}" rx="6" fill="${fill}"/>` +
      t(x + 8, y + 18, label, { size: 12, weight: 700 }) + (sub ? t(x + 8, y + 34, sub, { size: 10, fill: C.ink }) : '');
  };
  const allDay = (day, fill, label) => `<rect x="${x0 + day * colW + 4}" y="${top - 16}" width="${colW - 8}" height="14" rx="4" fill="${fill}"/>` +
    t(x0 + day * colW + 10, top - 5, label, { size: 10, weight: 700 });
  g += ev(0, 7.5, 15.5, S.A, 'A3', '07:30–15:30') + ev(1, 7.5, 15, S.A, 'A1', '07:30–15:00');
  g += ev(2, 13.5, 21.5, S.P, 'P1', '13:30–21:30') + ev(3, 21, 24, S.N, 'Night', '21:00–');
  g += ev(4, 0, 8, S.N, 'Night', '–08:00');
  g += ev(4, 8, 24, '#ebe9e3', 'Off', 'from 08:00');
  g += allDay(5, S.O, 'Off') + allDay(6, S.L, 'AL');
  g += box(574, 300, 164, 98, { fill: C.white, stroke: C.orange, sw: 2, rx: 10 });
  ['Rest day after a', 'night shift starts', 'when it ends, not', 'at midnight.'].forEach((l, i) => {
    g += t(586, 324 + i * 20, l, { size: 12, weight: i ? 400 : 700 });
  });
  g += arrow(574, 330, x0 + 5 * colW - 8, top + 8 * hourH + 40);
  return frame('Synced to Google Calendar', g);
}

// 3. Reminder timing
function reminders() {
  const x0 = 176, x1 = 752, hx = (h) => x0 + ((x1 - x0) * h) / 24;
  const rows = [
    { name: 'AM shift', sleep: [[0, 5.5], [22.5, 24]], shift: [7.5, 15.5], fill: S.A, at: 8, note: '30 min after start' },
    { name: 'PM shift', sleep: [[0.5, 9]], shift: [13.5, 21.5], fill: S.P, at: 12.5, note: '1 h before start' },
    { name: 'Night shift', sleep: [[9, 16]], shift: [21, 24], fill: S.N, at: 20, note: '1 h before start' },
    { name: 'Day off', sleep: [[0, 8.5]], shift: null, fill: S.O, at: 9.5, note: 'mid-morning' },
  ];
  let g = '';
  for (let h = 0; h <= 24; h += 3) {
    g += `<path d="M${hx(h)} 112V492" stroke="${C.grid}" stroke-width="1.5"/>` + t(hx(h), 104, `${String(h).padStart(2, '0')}`, { size: 11, fill: C.ink, anchor: 'middle' });
  }
  rows.forEach((r, i) => {
    const y = 132 + i * 92;
    g += t(48, y + 26, r.name, { size: 14, weight: 700 });
    g += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="40" rx="6" fill="${C.white}" stroke="${C.grid}" stroke-width="1.5"/>`;
    for (const [a, b] of r.sleep) g += `<rect x="${hx(a)}" y="${y + 4}" width="${hx(b) - hx(a)}" height="32" rx="4" fill="${C.sleep}"/>`;
    if (r.shift) g += `<rect x="${hx(r.shift[0])}" y="${y + 4}" width="${hx(r.shift[1]) - hx(r.shift[0])}" height="32" rx="4" fill="${r.fill}"/>`;
    const mx = hx(r.at);
    g += `<path d="M${mx} ${y - 6}V${y + 46}" stroke="${C.orange}" stroke-width="3"/>`;
    g += `<path d="M${mx} ${y - 14}l8 8l-8 8l-8 -8z" fill="${C.orange}"/>`;
    const label = `${String(Math.floor(r.at)).padStart(2, '0')}:${r.at % 1 ? '30' : '00'} · ${r.note}`;
    g += mx > 560 ? t(mx - 12, y + 62, label, { size: 12, anchor: 'end' }) : t(mx + 12, y + 62, label, { size: 12 });
  });
  const legend = (x, fill, label, stroke = 'none') => `<rect x="${x}" y="526" width="16" height="16" rx="3" fill="${fill}" stroke="${stroke}"/>` + t(x + 24, 539, label, { size: 12, fill: C.ink });
  g += legend(176, C.sleep, 'asleep') + legend(276, S.A, 'shift') + `<path d="M384 526l8 8l-8 8l-8 -8z" fill="${C.orange}"/>` + t(400, 539, 'reminder, repeats until Done', { size: 12, fill: C.ink });
  return frame('Reminders follow her day, not the clock', g);
}

// 4. Architecture
function architecture() {
  // Inside the dashed boundary: what runs on the home server.
  let g = box(168, 96, 440, 300, { fill: 'none', stroke: C.ink, sw: 1.5, rx: 16, dash: '6 5' }) + t(184, 120, 'Home server · Docker Compose', { size: 12, fill: C.ink });
  g += box(192, 150, 136, 92) + t(260, 188, 'bb-bot', { size: 15, weight: 700, anchor: 'middle' }) + t(260, 210, 'Telegram client', { size: 11, fill: C.ink, anchor: 'middle' });
  g += box(192, 288, 136, 80) + t(260, 322, 'Redis', { size: 15, weight: 700, anchor: 'middle' }) + t(260, 344, 'reminder state', { size: 11, fill: C.ink, anchor: 'middle' });
  g += box(372, 140, 216, 236, { fill: '#eef1f6' }) + t(480, 170, 'FastAPI backend', { size: 15, weight: 700, anchor: 'middle' });
  ['OCR + colour', 'Calendar sync', 'Reminders'].forEach((m, i) => {
    g += box(388, 188 + i * 60, 184, 44, { rx: 8, sw: 2 }) + t(480, 215 + i * 60, m, { size: 13, anchor: 'middle' });
  });
  // Outside it: the phone and Google.
  g += box(32, 156, 112, 80, { fill: C.paper }) + t(88, 190, 'Telegram', { size: 14, weight: 700, anchor: 'middle' }) + t(88, 210, 'on her phone', { size: 10, fill: C.ink, anchor: 'middle' });
  g += box(640, 196, 128, 80, { fill: C.paper }) + t(704, 230, 'Google', { size: 14, weight: 700, anchor: 'middle' }) + t(704, 250, 'Calendar', { size: 14, weight: 700, anchor: 'middle' });
  g += arrow(148, 196, 186, 196) + arrow(332, 196, 366, 196) + t(349, 186, 'API', { size: 10, fill: C.ink, anchor: 'middle' });
  g += arrow(368, 328, 334, 328) + arrow(592, 236, 634, 236);
  // CI/CD
  const steps = [['Merge to main', 56], ['GitHub Actions', 234], ['Container Registry', 412], ['Pull + restart', 590]];
  steps.forEach(([label, x], i) => {
    g += box(x, 452, 154, 56, { rx: 10, fill: i === 3 ? '#eef1f6' : C.white }) + t(x + 77, 485, label, { size: 13, weight: 700, anchor: 'middle' });
    if (i < 3) g += arrow(x + 158, 480, x + 174, 480);
  });
  g += t(56, 440, 'Release', { size: 12, weight: 700, fill: C.ink });
  g += t(56, 540, 'Lint, tests (including OCR accuracy) and a Docker build run on every pull request.', { size: 12, fill: C.ink });
  return frame('How it fits together', g);
}

await mkdir('originals/bb-bot', { recursive: true });
const out = { '1-reading-a-roster': ocr(), '2-synced-week': calendar(), '3-reminder-timing': reminders(), '4-architecture': architecture() };
for (const [name, svg] of Object.entries(out)) await sharp(Buffer.from(svg)).png().toFile(`originals/bb-bot/${name}.png`);
console.log(Object.keys(out).join('\n'));
