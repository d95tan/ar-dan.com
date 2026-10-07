import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // Files starting with `_` (like `_template.md`) are ignored.
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    // A cover can be a local file next to the Markdown (`./images/x.jpg`) or a full URL.
    const img = z.union([z.url(), image()]);
    // A gallery entry can also be a folder (a path with no file extension); every image directly inside it is shown, sorted by file name.
    const folder = z.string().regex(/^\.{1,2}\/(?:.*\/)?[^./]+\/?$/);
    const video = z.string().regex(/^\.{1,2}\/.*\.(mp4|webm)$/i);
    const galleryItem = z.union([z.url(), folder, video, image()]);
    return z.object({
      title: z.string(),
      discipline: z.enum(['software', 'architecture']),
      summary: z.string(),
      year: z.number().int(),
      period: z.string().optional(),
      org: z.string().optional(),
      role: z.string().optional(),
      stack: z.array(z.string()).default([]),
      cover: img.optional(),
      coverAlt: z.string().optional(),
      gallery: z.preprocess((v) => (typeof v === 'string' ? [v] : v), z.array(galleryItem)).default([]),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    });
  },
});

const cvEntry = z.object({
  title: z.string(),
  org: z.string(),
  start: z.string(),
  end: z.string().optional(),
  summary: z.string().optional(),
  points: z.array(z.string()).default([]),
});

const experience = defineCollection({ loader: file('src/content/cv/experience.yml'), schema: cvEntry });
const education = defineCollection({ loader: file('src/content/cv/education.yml'), schema: cvEntry });
const awards = defineCollection({ loader: file('src/content/cv/awards.yml'), schema: cvEntry });
const certifications = defineCollection({
  loader: file('src/content/cv/certifications.yml'),
  schema: cvEntry.extend({ start: z.string().optional() }),
});

export const collections = { projects, experience, education, awards, certifications };
