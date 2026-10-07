---
title: EtaPod
discipline: software
summary: Backend and digital twin for a containerised PV-panel recycling line.
year: 2024
org: EtaVolt
role: Backend lead
stack: [FastAPI, SQLAlchemy, Pydantic, Alembic, DuckDB, SQLite, React, Jinja]
cover: ./images/etapod/Screenshot 2024-10-30 140607.png
coverAlt: EtaPod interface showing the containerised recycling line and equipment status
gallery: 
    - ./images/etapod
featured: true
order: 70
---

EtaPod streamlines the recycling of end-of-life photovoltaic panels. It manages and monitors the whole recycling workflow, from incoming panel batch tracking to real-time equipment operations.

The backend is a modular FastAPI service tailored to EtaVolt's containerised recycling line. SQLAlchemy models the relationships between containers, batches, equipment and materials, capturing real-time state changes in the process. A custom Pydantic validation layer enforces data integrity on inputs like batch status and equipment actions, returning specific HTTP errors (such as 409) for conflicting operations.

A key feature is real-time equipment and location tracking. The backend synchronises container configurations with a central repository, so users can follow container movements and spot changes in location or operational status. File handling supports single and batch uploads, organised by UUID to keep things consistent and conflict-free.

## Key contributions

- Lead for backend development
- Database design for graceful sync between local and cloud databases
- Dynamic validation
- Hardware and software integration
- Human–machine interface
- 3D modelling and digital twin

<small>All rights reserved EtaVolt Pte Ltd.</small>
