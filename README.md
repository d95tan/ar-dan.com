# ar-dan.com

Source for [ar-dan.com](https://ar-dan.com), the portfolio of Dan Tan, architect turned software engineer.

## Design

The site is one body of work seen through two lenses. Architecture and software are usually presented as separate chapters of a career; here they share a single plan, and the visitor chooses which way to read it.

- **Archi** is set on drafting paper: a navy-ink blueprint grid, monochrome photography and a crosshair cursor, the way a drawing set looks on a studio desk.
- **Tech** is set in a dark code editor: a dot grid, monospaced type and an `Ln/Col` cursor, the way the same work looks on a developer's screen.

The divider on the home page is the threshold between the two. Visitors drag it to move from one discipline into the other, much like walking from one room into the next, or flip it from the header once they know their way around. The mode changes emphasis, not access: it decides which discipline's projects come first, and the other stays one scroll away, because the two careers inform each other.

The grid is the underlying order, as a structural grid is in a building. Text, cards and section spacing all land on whole or half cells, so the layout reads as drawn rather than arranged. Projects are treated as sheets in a drawing set, each with a sheet number (`S-01`, `A-01`, …), so the portfolio can be browsed like a set of construction documents.

## Tech

The site is built with [Astro](https://astro.build) and compiles to plain static HTML: no server, no database, no client-side framework. Both modes come from the same markup and are switched with CSS custom properties, so changing mode restyles the page without reloading it. Layout sizes are multiples of a single 24px `--cell`, which is how content edges stay on the background grid at every screen size. Projects are Markdown files validated against typed schemas, so adding one is a matter of writing it, not wiring it up.

## Development

### Run it locally

Requires Node 22.12 or newer.

```sh
npm install
npm run dev      # http://localhost:4321, live reload
npm run build    # outputs the static site to dist/
npm run preview  # serves dist/ to check the production build
npm run check    # type-checks the content and components
npm run images   # makes web-sized copies of originals/ (see Images)
npm run check:assets  # fails on committed originals (oversized or with EXIF/GPS)
npm run test:e2e # browser smoke tests against dist/ (see Testing)
```

### Add a project

1. Copy `src/content/projects/_template.md` to `src/content/projects/<slug>.md`. The file name becomes the URL, `/work/<slug>`.
2. Fill in the frontmatter. The template explains every field; only `title`, `discipline`, `summary` and `year` are required.
3. Add the images (see below) and reference them relatively, for example `cover: ./images/<slug>/cover.jpg`.
4. Write the case study below the frontmatter in Markdown.

The project then appears automatically: a card on `/work`, a detail page, a sheet number (`S-01`, `A-01`, …), the filters and the previous/next links. Set `featured: true` to show it on the home page too.

Content is validated against typed schemas in `src/content.config.ts`. A missing field or a broken image path fails the build with a message naming the file, so a broken page can't go live.

### Images

Full-resolution photos and videos live in `originals/`, which is git-ignored. Mirror the folder layout of `src/content/projects/images/`, then run:

```sh
npm run images            # only new or changed files
npm run images -- --force # redo everything
```

This writes web-sized copies to `src/content/projects/images/` under the same names, so project files don't need editing:

- **Photos:** at most 2400px on the longest side, rotated according to their EXIF data, with metadata (including GPS) stripped.
- **Videos:** 720p, 30fps and silent, so they can autoplay.

Only the web-sized copies are committed, and Astro resizes them again at build time.

A project's `gallery` can list individual files, point at a whole folder (`gallery: ./images/<slug>`), or mix the two. A folder adds every image and video directly inside it, sorted by file name (`1.jpg, 2.jpg, … 10.jpg`).

Gallery items are laid out two to a row and scaled to the same height, so portrait and landscape shots sit together without gaps. Videos play muted on a loop while they're on screen, and stay paused, with controls, for visitors who prefer reduced motion.

### Where things live

| To change | Edit |
| --- | --- |
| Name, email, socials, hero photo, about text, CV intro, terminal history | `src/site.ts` |
| Jobs, education, awards, certifications | `src/content/cv/*.yml` (newest first, by `start`) |
| Colours, fonts, grid size | top of `src/styles/global.css` |
| Default mode for first-time visitors | `defaultMode` in `src/site.ts` |
| Browser tab icon | `public/favicon.svg` |
| Phone home-screen icon | `scripts/apple-touch-icon.mjs`, then `node scripts/apple-touch-icon.mjs` |
| Redirects from old URLs | `redirects` in `astro.config.mjs` |
| Project order and home page picks | `order` (higher first, within each discipline) and `featured` in each project's frontmatter |

### Testing

[Playwright](https://playwright.dev) smoke tests in `tests/e2e/` run in Chromium against the production build, served by `astro preview`:

```sh
npx playwright install chromium   # once
npm run build && npm run test:e2e
```

They cover:

- Every page in the sitemap loads with one `h1`, no console errors and no failed requests.
- The header toggle switches mode and remembers it, and the home page divider switches mode from the keyboard.
- `/work` lists the current mode's discipline first, and its filters show one discipline at a time.
- The old Wix URLs redirect, and unknown URLs show the 404 page.
- Gallery images load, and gallery videos are served.

When a test fails, `npx playwright show-report` opens the report with screenshots. In CI, the report is attached to the run.

### Deploy

The site is served by Cloudflare Workers (static assets only, no server code). GitHub Actions builds and deploys it. Cloudflare's own Git integration isn't used.

| Branch | Deploys to | Who can see it |
| --- | --- | --- |
| `staging` | `staging.ar-dan.com` (Worker `ar-dan-staging`) | Only me, behind Cloudflare Access |
| `main` | `www.ar-dan.com` (Worker `ar-dan`) | Everyone. `ar-dan.com` redirects to `www` |

To release, push to `staging` and check `staging.ar-dan.com`. Then open a pull request from `staging` into `main`. When it merges, the production deploy waits for approval in the Actions tab.

Every pull request and push runs [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml):

- **build**: `npm run check`, `npm run check:assets` and `npm run build`. The built `dist/` is reused by the later jobs, so what was tested is what ships.
- **links**: every internal link and image in `dist/` must resolve.
- **lighthouse**: an accessibility score under 0.9 fails the run. Performance, best practices and SEO only warn. Reports are attached to the run as artifacts.
- **e2e**: the Playwright smoke tests (see Testing).
- **spelling**: [cspell](https://cspell.org) in British English. It only leaves warnings and never fails the run. Add new names to `words` in `cspell.json`.
- **deploy**: runs on pushes only, after the checks above pass.

`npm run check:assets` fails if an image is over 2400px on its longest side (PNGs excepted), still carries EXIF metadata such as GPS location, or a photo or video is unusually large. Each of these means an original was committed without running `npm run images` first.

External links are checked weekly by [`external-links.yml`](.github/workflows/external-links.yml), and broken ones are reported in the run summary without failing. Dependabot opens weekly grouped updates against `staging`.

Workers, custom domains and the `workers.dev` switch are configured in [`wrangler.jsonc`](wrangler.jsonc). The deploy job needs two repository secrets: `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" template plus Zone DNS Edit, limited to `ar-dan.com`) and `CLOUDFLARE_ACCOUNT_ID`.

To roll back a bad release, go to Workers & Pages, open `ar-dan`, then Deployments, and roll back to the previous version. Then fix or revert the change in git.

## Licence

The code is free to read and learn from. The written content and images are © Dan Tan or their respective owners, as noted on each project, and may not be reused without permission.
