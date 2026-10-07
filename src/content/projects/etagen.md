---
title: EtaGen
discipline: software
summary: Solar pre-sales tool that lets building owners see their roof's solar potential in 3D.
year: 2024
org: EtaVolt
role: Full-stack engineer
stack: [React, Three.js, MapBox, Chart.js, FastAPI, Firestore, GCP]
cover: ./images/etagen/EtaGen-5.png
coverAlt: EtaGen 3D model of a building with solar panels placed on its roofs
gallery: 
  - ./images/etagen
links:
  - label: Live app
    url: https://vg-etagen.etavolt.app/
featured: true
order: 30
---

EtaGen simplifies the solar sales process by bridging the gap between complex simulation tools and potential customers. It offers an intuitive platform that lets building owners quickly visualise their property's solar potential.

The frontend is built with React, using Three.js for 3D model handling and visualisation, MapBox for map integration and roof data, and Chart.js for data presentation.

On the backend, I developed algorithms in FastAPI to optimise panel placement, maximising usable space while complying with local regulations. Simulated outcomes were benchmarked against real-world data, and the software also provides detailed financial projections and return-on-investment calculations to support decision-making.

## Key contributions

- Panel placement and optimisation algorithm
- Fire-safety compliance algorithm
- Frontend revamp to include authentication
- Responsive design across a range of devices
- Variable panel size, model and unit price
- Database design, and migration from MongoDB to Firestore
- Cloud deployment on Google Cloud Platform

<small>All rights reserved EtaVolt Pte Ltd.</small>
