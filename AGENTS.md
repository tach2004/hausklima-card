# AGENTS.md — HausKlima Card

## Purpose
This repository develops **HausKlima Card** (`custom:hausklima-card`), an independent HACS-installable Home Assistant Lovelace custom card. Its primary purpose is a visually clean, interactive SVG cross-section of a house and detached garage, with configurable climate sensor readings.

## Working agreement
- The owner plans requirements and design in ChatGPT. Implement only work explicitly approved for the current phase; do not treat this file as a request to implement every future feature.
- Communicate findings, choices, blockers, and pull-request summaries in **German**.
- **Never invent** missing house dimensions, room geometries, sensors, entity IDs, sample readings presented as real data, supported units, or implementation results. Ask for decisions where required; clearly mark temporary schematic placeholders.
- Prefer small, reviewable changes and a pull request against `main`. Do not merge pull requests or deploy into the owner's Home Assistant without explicit approval.
- Before coding, inspect the actual repository state. Read `README.md`, `docs/architecture.md`, `docs/validation.md`, and any phase documentation **if those files exist**. Existing verified code and current accepted requirements take precedence over speculative plans.
- Keep `AGENTS.md` for stable rules. Detailed design decisions, implementation plans, and open questions belong in appropriate project documents, not a growing monolithic instruction file.

## Architecture and design principles
- Independent frontend card using TypeScript, Lit/Web Components, SVG, and local styling; avoid mandatory dependencies on card-mod, Mushroom, Bubble Card, ApexCharts, or other HACS cards.
- Bundle suitable for HACS Dashboard installation, with expected output `dist/hausklima-card.js`.
- A user-friendly **visual Lovelace card editor is a core requirement**, not an optional afterthought. Users should eventually configure rooms, sensors, labels, positions and visibility without editing YAML.
- Support Home Assistant light/dark themes and responsive desktop/tablet/mobile layouts; prioritize legibility and a restrained, polished design.
- Model building, floors, rooms, visibility layers, sensor mappings, and presentation separately. Use stable room IDs and extensible metric types.
- Preserve keyboard accessibility where relevant, handle entity state `unavailable` distinctly from an unconfigured entity, and do not silently fabricate measurements.
- Before proposing changes to dependencies or APIs, check the current applicable Home Assistant and HACS documentation.

## Confirmed building and UI requirements
- House footprint: **12 m × 10 m**. The viewed side is the **12 m eaves side (Traufseite)**. The gable/ridge is **parallel** to the viewed side. Do **not** draw a gable triangle across the visible 12 m facade.
- Detached garage to the **right**, approximately **5 m** from the house, not physically connected; footprint **6 m × 6 m**, height **3 m**.
- Basement (Keller), left to right: **Werkstatt 4.00 m**, **Flur 3.40 m**, **Waschküche 3.50 m**; clear height **2.50 m**.
- Ground floor (EG), left to right: **Wohnzimmer 6.50 m**, **Flur 0.90 m**, **Küche 3.51 m**; clear height **2.64 m**.
- Converted attic (DG), left to right: **Schlafzimmer 7.60 m**, **Abstellraum 3.60 m**; knee-wall height **1.00 m** and interior ridge height **4.00 m** above the DG floor.
- Reported wall thickness: **0.24 m**. Which walls this applies to, the complete dimension chains and the final roof cutaway geometry are **not fully confirmed**. Keep discrepancies explicit; do not adjust room widths or derive a final roof section by guessing.
- Primary UI: show the visible cross-section and allow access to rooms behind it via a **separate room overview (variant A)**. Optional future enhancement: **switchable foreground/background room layers (variant B)**. Do not build a complex 3D view unless requested.
- Show climate measurements in context without overloading the house drawing. Prioritize temperature and relative humidity on the overview; allow detail views/optional visibility for further values.

## Sensor model and behavior
- Room or location metrics may include **temperature**, **relative humidity**, **absolute humidity**, **CO₂**, **VOC**, and future extensible types.
- All types are optional. Only show configured metrics, while preserving a clear `unavailable` state for configured but unavailable entities.
- Support multiple entities of a given metric for one room/location, for example distinct Homematic and Ecowitt outdoor temperature sensors, with a configurable primary reading and secondary readings in details.
- Relative and absolute humidity are separate optional inputs; do not assume absolute humidity is present or automatically calculate it unless explicitly requested in a later phase.
- VOC measurements differ in unit/index conventions; use the actual entity metadata, not an assumed universal unit.
- Do not hard-code private real-world Home Assistant entity IDs in the source or examples.

## Verification and delivery
- Run the available project checks, tests, and build commands appropriate to the changed files; report which passed, failed, or could not run.
- For UI changes, review at least desktop and narrow/mobile widths and light/dark themes when available.
- Preserve the MIT license notices and relevant attribution.
- Describe the actual changed files, open questions, verification outcomes and next proposed phase in the pull request. Do not claim HA/HACS integration testing unless it was actually performed.
