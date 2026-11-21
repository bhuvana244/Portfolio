# Bhuvana Shree N. | Portfolio

The portfolio is a single responsive static site. Each page exists once; resize the browser to view desktop, tablet, and mobile layouts.

## Run locally

From this directory, start one server:

```powershell
python -m http.server 8765
```

Then open http://localhost:8765/. Stop the server with Ctrl+C. `npx serve .` also works if you already use Node.js.

## Site structure

- `index.html`, `about.html`: Home and About.
- `projects/`: one case-study page per project.
- `css/tokens.css`: shared palette, type, spacing, and radii.
- `css/base.css`, `css/components.css`: shared base and component behavior.
- `css/pages/`: page-level styling, including responsive overrides.
- `components/`: shared navigation, footer, project-card template, and animated thumbnail partials.
- `js/project-data.js`: the single list that generates the Home project cards.
- `assets/images/`: project imagery.

## Add a project

1. Add one case-study page under `projects/` and use the shared case-study stylesheet and page CSS.
2. Add the project thumbnail SVG/CSS as one partial in `components/thumbs/`; keep its prefixed IDs/classes and reduced-motion rules.
3. Add the project metadata, link, thumbnail key, label, and responsive descriptions to `js/project-data.js`. The Home card is rendered from this list.
4. Add the project to the appropriate case-study ?Up next? lists.
5. Put any case-study images under `assets/images/` and reference them from the page root (project pages set a root `<base>`).

The thumbnail loader inserts each SVG inline so its CSS animation and reduced-motion behavior work without an animation library.
