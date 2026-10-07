// Makes web-sized copies of everything in `originals/` (git-ignored) into `src/content/projects/images/`,
// keeping the same folders and file names so project files don't need to change.
//
//   npm run images            only files that are new or changed since the last run
//   npm run images -- --force  redo everything
//
// Photos: longest side at most 2400px, EXIF rotation applied, metadata (including GPS) stripped.
// Videos: 720p, 30fps, no audio, H.264 with fast start, so they autoplay muted in the gallery.

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, extname, join, relative } from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const SRC = 'originals';
const OUT = 'src/content/projects/images';
const MAX = 2400;
const force = process.argv.includes('--force');
const run = promisify(execFile);

const PHOTO = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const VIDEO = new Set(['.mp4', '.mov', '.webm', '.m4v']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const mtime = (path) => stat(path).then((s) => s.mtimeMs, () => 0);
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function photo(input, output) {
  const base = () => sharp(input).rotate().resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true });
  const ext = extname(input).toLowerCase();
  if (ext !== '.png') {
    const img = base();
    if (ext === '.webp') img.webp({ quality: 82 });
    else if (ext === '.avif') img.avif({ quality: 60 });
    else img.jpeg({ quality: 82, mozjpeg: true });
    return void (await img.toFile(output));
  }
  // PNG is lossless, so re-encoding a well-optimised original can make it bigger even after resizing.
  // Keep whichever is smaller; the site resizes for display either way.
  const encoded = await base().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  const original = await readFile(input);
  await writeFile(output, encoded.length < original.length ? encoded : original);
}

async function video(input, output) {
  await run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-an', '-vf', 'scale=1280:-2,fps=30',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    output,
  ]);
}

let done = 0, skipped = 0, before = 0, after = 0;
for await (const input of walk(SRC)) {
  const ext = extname(input).toLowerCase();
  const kind = PHOTO.has(ext) ? photo : VIDEO.has(ext) ? video : null;
  if (!kind) continue;

  const rel = relative(SRC, input);
  // Videos always come out as .mp4; photos keep their extension.
  const output = join(OUT, kind === video ? rel.slice(0, -extname(rel).length) + '.mp4' : rel);
  if (!force && (await mtime(output)) >= (await mtime(input))) {
    skipped++;
    continue;
  }

  await mkdir(dirname(output), { recursive: true });
  await kind(input, output);
  const [a, b] = await Promise.all([stat(input), stat(output)]);
  before += a.size;
  after += b.size;
  done++;
  console.log(`${rel}: ${mb(a.size)} → ${mb(b.size)}`);
}

console.log(`\n${done} compressed (${mb(before)} → ${mb(after)}), ${skipped} already up to date.`);
