import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'> & { sheet: string };

/** All published projects, newest first, each with a stable sheet number (S-01, A-01, ...). */
export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft);
  entries.sort((a, b) => b.data.order - a.data.order || b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));

  const counters = { software: 0, architecture: 0 };
  return entries.map((entry) => {
    const n = ++counters[entry.data.discipline];
    const prefix = entry.data.discipline === 'software' ? 'S' : 'A';
    return Object.assign(entry, { sheet: `${prefix}-${String(n).padStart(2, '0')}` });
  });
}

export const disciplineLabel = (d: 'software' | 'architecture') => (d === 'software' ? 'Software' : 'Architecture');

export const yearLabel = (p: Project) => p.data.period ?? String(p.data.year);

const projectImages = import.meta.glob<ImageMetadata>('/src/content/projects/**/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  import: 'default',
});
const projectVideos = import.meta.glob<string>('/src/content/projects/**/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type GalleryItem =
  | { kind: 'image'; src: string | ImageMetadata; ratio: number }
  | { kind: 'video'; src: string; ratio: number };

/** Width ÷ height from the first video track header (`tkhd`) of an MP4; 16:9 if it can't be read. */
function videoRatio(file: string): number {
  const buf = readFileSync(join(process.cwd(), file));
  const walk = (start: number, end: number): number | undefined => {
    for (let at = start; at + 8 <= end; ) {
      const size = buf.readUInt32BE(at);
      const type = buf.toString('latin1', at + 4, at + 8);
      const boxEnd = size === 0 ? end : at + size;
      if (size < 8 && size !== 0) return undefined;
      if (type === 'moov' || type === 'trak') {
        const found = walk(at + 8, boxEnd);
        if (found) return found;
      } else if (type === 'tkhd') {
        const w = buf.readUInt32BE(boxEnd - 8) / 65536;
        const h = buf.readUInt32BE(boxEnd - 4) / 65536;
        if (w > 0 && h > 0) return w / h;
      }
      at = boxEnd;
    }
  };
  return walk(0, buf.length) ?? 16 / 9;
}

/** Resolves a folder (or a single video file) to its images and videos, relative to the project's Markdown file. */
function folderItems(project: Project, folder: string): GalleryItem[] {
  const parts = `/${project.filePath ?? 'src/content/projects/x.md'}`.split('/').slice(0, -1);
  for (const seg of folder.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg && seg !== '.') parts.push(seg);
  }
  const resolved = parts.join('/');
  if (resolved in projectVideos) return [{ kind: 'video', src: projectVideos[resolved], ratio: videoRatio(resolved.slice(1)) }];
  const dir = `${resolved}/`;
  const inDir = (k: string) => k.startsWith(dir) && !k.slice(dir.length).includes('/');
  const files = [...Object.keys(projectImages), ...Object.keys(projectVideos)]
    .filter(inDir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) throw new Error(`${project.id}: gallery folder "${folder}" has no images or videos`);
  return files.map((k): GalleryItem => {
    if (k in projectVideos) return { kind: 'video', src: projectVideos[k], ratio: videoRatio(k.slice(1)) };
    const img = projectImages[k];
    return { kind: 'image', src: img, ratio: img.width / img.height };
  });
}

/** Gallery entries with any folders expanded into the images and videos they contain. Remote images are assumed to be 4:3. */
export const galleryItems = (project: Project): GalleryItem[] =>
  project.data.gallery.flatMap((item): GalleryItem[] => {
    if (typeof item !== 'string') return [{ kind: 'image', src: item, ratio: item.width / item.height }];
    if (/^https?:/.test(item)) return [{ kind: 'image', src: item, ratio: 4 / 3 }];
    return folderItems(project, item);
  });
