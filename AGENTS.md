# AGENTS.md

Static portfolio site, no backend. Markup lives in `index.html`; custom CSS in `styles/base.css` / `layout.css` / `components.css`; behavior in ES modules under `scripts/` (entry: `main.js`). Project cards are light-DOM Web Components (`scripts/components/project-card.js`, `projects-list.js`) rendered from `content/projects.json` — edit the JSON to change cards; do not hardcode card markup back into HTML.

## No build system

- No package.json, bundler, tests, lint, or CI. Do not invent install/build steps.
- ES modules and `fetch` fail under `file://`; verify by serving statically: `python3 -m http.server`.
- Styling depends on the Tailwind Play CDN (`cdn.tailwindcss.com`, loaded in `<head>`) compiling classes at runtime — arbitrary values like `bg-[#110e25]` work without any config, and classes on dynamically inserted components are compiled via its DOM mutation observer. Fonts (Inter via Google Fonts) and all images (hotlinked `googleusercontent.com` "aida-public" URLs) are external; nothing renders styled offline.
- All paths must stay relative (`./…`) — the site targets GitHub Pages project URLs, not a domain root.

## Conventions

- `DESIGN.md` is the design spec: color palette, typography scale, component styles. Match its tokens (`#110e25` surfaces, `#8b5cf6` accent, Inter, pill buttons, card shadows) when adding/editing sections.
- Custom effects live in `styles/components.css` (e.g. `.reveal` + `.active`, `.shimmer-text`, `.hover-lift`), menu open/close transitions in `styles/layout.css`. Scroll-reveal requires both: add `.reveal` to the element AND ensure the `IntersectionObserver` in `scripts/main.js` picks it up.
- Reduced motion is handled twice (CSS `@media (prefers-reduced-motion)` and a JS check in `main.js`); keep both paths consistent if touching animations.
- Known inconsistency: `<title>` says "Iurii Rogulia" while README/DESIGN.md say Sergio Stankevich (footer email is also `iurii@rogulia.fi`). Don't assume which is intended when rebranding — ask.
