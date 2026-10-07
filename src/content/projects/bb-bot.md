---
title: bb-bot
discipline: software
summary: Telegram bot that turns my wife's shift roster into calendar events, and times her daily reminders around a routine that changes every day.
year: 2026
org: Personal project
role: Sole developer
stack: [Python, Tesseract OCR, FastAPI, Telegram Bot API, Google Calendar API, Redis, Docker, GitHub Actions]
cover: ./images/bb-bot/bb-bot.png
coverAlt: Illustration of a monthly shift roster being read by OCR and turned into calendar events and reminders in a Telegram chat
gallery: ./images/bb-bot
links:
  - label: GitHub
    url: https://github.com/d95tan/bb_bot
---

My wife works rotating shifts. One week she's up before dawn, the next she's sleeping through the day after a night shift, so there's no fixed routine to hang daily tasks on. An alarm at the same time every day is either in the middle of her sleep or long after she's left for work, and things get missed. On top of that, her roster arrives each month as a colour-coded calendar inside an app that doesn't sync with anything.

So I built her a Telegram bot. She sends it a screenshot of the roster, and a few seconds later the whole month is in our shared calendar. From then on, the bot knows when she'll be awake and schedules her daily reminders around each day's shift.

The bot reads the month from the header, divides the calendar into a grid of day cells, and reads each shift code with Tesseract OCR. Short codes are easy to misread (a zero becomes an O, an 8 becomes an S), so recognition is limited to the characters that appear in known codes, and the result is fuzzy-matched against them. If a code still can't be read, the bot falls back to the cell's colour. Shift types, times and colours all live in a YAML file, so a new shift code is a config change rather than a code change.

Syncing replaces the month's events, so re-sending a corrected roster is always safe. Rest days that follow a night shift start when the night shift ends, not at midnight.

Reminder times follow her sleep and wake times rather than the clock. Each type of shift has its own rule: shortly after an early start, an hour before heading out for an afternoon or night shift, and mid-morning on days off. The bot keeps nudging until she taps Done, and tracks streaks so she can see the habit building.

What started as a single script is now a FastAPI backend that owns OCR, calendar sync and reminders, with the Telegram bot as a thin client on top, so other chat apps can be added later. Redis coordinates reminders so multiple instances never send duplicates.

It has been running daily since March 2026 on our home server, as three containers: the API, the Telegram bot and Redis. Every merge to `main` builds a new image in GitHub Actions and publishes it to GitHub Container Registry, so shipping a fix is a merge and a restart, and a `/version` command confirms what's live. Reminder state and streaks are stored on persistent volumes, so updates never lose her progress. In that time it has processed over 300 shifts, reading more than 95% of them correctly.

## Key features

- OCR pipeline with grid calibration, character whitelisting, fuzzy matching and colour fallback
- Over 95% of shifts read correctly in daily use, with an accuracy test against hand-labelled rosters on every pull request
- Google Calendar sync, including night-shift and rest-day handling
- Daily reminders scheduled around each day's shift, repeating until done, with streak tracking
- Refactor from a single bot into a FastAPI backend and a thin Telegram client
- CI/CD with GitHub Actions: linting, tests and Docker builds, with images published to GitHub Container Registry
