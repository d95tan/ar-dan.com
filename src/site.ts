import type { ImageMetadata } from 'astro';
import hero from './assets/sundial_hero.jpg';

export type Mode = 'archi' | 'tech';

export const SITE = {
  name: 'Dan Tan',
  shortName: 'ar.dan',
  title: 'Dan Tan — Architect turned Software Engineer',
  description:
    'Portfolio of Dan Tan: former Assistant Architect at RichardHO Architects, now a software engineer at Esri Singapore.',
  location: 'Singapore',
  email: 'd95tan@gmail.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/d95tan' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/dan-tan95/' },
    { label: 'Instagram', url: 'https://instagram.com/itsjustdan_' },
  ],
  defaultMode: 'tech' as Mode,

  hero: {
    image: hero as string | ImageMetadata,
    imageAlt: 'Sundial Structure, a slatted timber pavilion at Mapletree Business City, at dusk',
    caption: 'Fig. 01 — Sun Rise // Sun Set, Mapletree Business City',
    headline: "Hi! I'm Dan.\nI build things.",
    subline: 'Architect turned software engineer, Singapore.',
    whoami: 'dan tan — software engineer @ Esri Singapore',
  },

  // Shown in the hero terminal as `cat history.log`.
  history: [
    ['2020', 'B.A. Arch (Hons), NUS'],
    ['2021', 'M.Arch, NUS'],
    ['2021', 'Assistant Architect, RichardHO Architects'],
    ['2024', 'Software Engineering, General Assembly'],
    ['2024', 'Software Engineer, EtaVolt'],
    ['2025', 'Associate Software Engineer, Esri Singapore'],
    ['2026', 'Software Engineer, Esri Singapore'],
  ] as [string, string][],

  about: {
    lede: 'I love building things.',
    body: [
      'From building my first PC from scraps at the age of nine to choosing architecture as my degree, my love for building things has always been constant. As an Assistant Architect at RichardHO Architects, I worked under the mentorship of President\u2019s Design Award recipient Prof. Ar. Richard Ho, designing sustainable homes from first sketch to completion.',
      'Now I bring the same design thinking to software as a Software Engineer at Esri Singapore, working with the ArcGIS platform. Before that, at EtaVolt, I designed and built solar lifecycle products end to end, from 3D visualisation in the browser to the APIs and data models behind them.',
    ],
  },

  // Shown under the heading at the top of /cv.
  cvIntro:
    'I\u2019m a Software Engineer at Esri Singapore, building GIS automation, data pipelines and developer tooling on the ArcGIS platform for Singapore government agencies. I trained and practised as an architect first, and still work the same way: understand the people who will use it, plan the structure, then build it to last.',
};
