---
# Copy this file to `<slug>.md` (the file name becomes the URL: /work/<slug>).
title: Project name
discipline: software            # software | architecture
summary: One sentence shown on the card and in link previews.
year: 2025                      # used for sorting
# period: 2021–23               # optional display text instead of the year
org: Company, practice or "Personal project"
role: What you did
stack: [React, FastAPI]         # tags; for architecture use things like [Residential, Timber]
cover: ./images/project-name.jpg   # local file next to this folder, or a full https:// URL
coverAlt: Describe the image for screen readers
gallery:                        # optional extra images shown under the write-up
  - ./images/project-name-2.jpg
  - ./images/project-name/      # a folder adds every image in it, sorted by file name
# gallery: ./images/project-name/   # or just a single folder on its own
links:                          # optional
  - label: Live app
    url: https://example.com
  - label: GitHub
    url: https://github.com/d95tan/repo
featured: false                 # true = shown on the home page
order: 0                        # higher numbers sort first; ties sort by year
draft: false                    # true = only visible in `npm run dev`
---

Write the case study here in Markdown.

## Key contributions

- First thing you did
- Second thing you did
