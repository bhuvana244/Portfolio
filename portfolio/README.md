# Bhuvana Shree N, Portfolio: design reference

Six pages exported from Claude Design. They are REFERENCE MOCKUPS, not production code.
The markup and inline styles carry the exact values (colours, type, spacing, radii,
shadows, layout). Implement them faithfully in your own stack.

## Fidelity rules (important)

The coded output must be a faithful, pixel-accurate implementation of these designs.

- Do not redesign, reinterpret, simplify, or add creative improvements.
- Do not change layouts, spacing, alignment, sizing, or positioning.
- Do not modify colours, typography, borders, shapes, or visual elements.
- Do not add, remove, or replace any components.
- Keep the exact content, hierarchy, proportions, and overall appearance.
- Keep all elements consistent with the reference. No intentional visual differences.

## Pages

| File | Page |
| --- | --- |
| `Main.dc.html` | Home (entry point) |
| `About.dc.html` | About |
| `ExamDuo.dc.html` | Case study: Mock Analysis Redesign @ ExamDuo |
| `MediTrack.dc.html` | Case study: MediTrack, Symptom-First Search |
| `ColorEase.dc.html` | Case study: ColorEase, 3rd Place @ InnoVeX |
| `ECI.dc.html` | Case study: ECI Citizen Services Rebuild |

Pages link to each other by sibling file name (`Main.dc.html`, `ExamDuo.dc.html`, ...).
Home's project cards open the case studies; each case study ends with thanks, a divider,
"Up next" and a Contact row.

## Shared files

- `case-study.css` is shared by the four case studies.
- `assets/` holds every uploaded image, deduplicated (file names are content hashes).
- `cursor.js` is the custom blue square cursor used on every page. Mouse devices only.
- `support.js` and `vendor/react*.js` are only the runtime that renders the `.dc.html`
  files in a browser. They are not part of the design.

## Viewing

Serve this folder, e.g. `python3 -m http.server`, and open `Main.dc.html`.
Some browsers block the scripts over `file://`.
