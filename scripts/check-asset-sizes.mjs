// Fails if an image or video looks like a full-resolution original rather than a web-sized copy,
// which usually means it was committed without running `npm run images` first. Also fails on any
// EXIF metadata, since camera originals can carry GPS coordinates into the public repo.
//
//   npm run check:assets

import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const DIRS = ['src/content/projects/images', 'src/assets', 'public'];
// Matches MAX in compress-images.mjs.
const MAX_SIDE = 2400;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

const PHOTO = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const VIDEO = new Set(['.mp4', '.mov', '.webm', '.m4v']);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const problems = [];
let checked = 0;
for (const dir of DIRS) {
  for await (const path of walk(dir)) {
    const ext = extname(path).toLowerCase();
    if (!PHOTO.has(ext) && !VIDEO.has(ext)) continue;
    checked++;
    const { size } = await stat(path);

    if (VIDEO.has(ext)) {
      if (size > MAX_VIDEO_BYTES) problems.push(`${path}: ${mb(size)}, over ${mb(MAX_VIDEO_BYTES)}`);
      continue;
    }
    if (size > MAX_PHOTO_BYTES) problems.push(`${path}: ${mb(size)}, over ${mb(MAX_PHOTO_BYTES)}`);
    const { width = 0, height = 0, exif } = await sharp(path).metadata();
    if (exif) problems.push(`${path}: has EXIF metadata (may include GPS location)`);
    // compress-images.mjs keeps a PNG original when it is smaller than the resized copy, so PNGs may exceed MAX_SIDE.
    if (ext !== '.png' && Math.max(width, height) > MAX_SIDE) {
      problems.push(`${path}: ${width}x${height}px, longest side over ${MAX_SIDE}px`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} file(s) look like originals. Put the full-size file in originals/ and run \`npm run images\`:\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`${checked} images and videos checked, all web-sized.`);
