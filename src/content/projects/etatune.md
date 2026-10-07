---
title: EtaTune
discipline: software
summary: ML health prediction for photovoltaic systems, with remediation advice and earnings forecasts.
year: 2024
org: EtaVolt
role: Full-stack engineer
stack: [React, Chart.js, FastAPI, pandas, NumPy, Matplotlib, pvlib]
cover: ./images/etatune/Screenshot 2024-10-29 145308.png
coverAlt: EtaTune recommendation screen with forecasted power generation chart
gallery:
  - ./images/etatune/EtaTune Simple.png
  - ./images/etatune/EtaTune Detailed.png
links:
  - label: Live app
    url: https://etatune.etavolt.app/
featured: true
order: 10
---

EtaTune uses machine learning to analyse and predict the health of photovoltaic systems. By ingesting historical inverter data, it identifies degradation patterns and pinpoints their root causes.

From those insights, EtaTune recommends targeted remediation such as regeneration or panel replacement. It forecasts future generation both with and without remediation so users can compare outcomes, and calculates the financial impact of each option to support data-driven decisions.

## Key contributions

- Better prediction accuracy by factoring in historical weather and irradiance data
- Complete refactor of the API server
- New fire-safety score calculation
- Unit testing

<small>All rights reserved EtaVolt Pte Ltd.</small>
