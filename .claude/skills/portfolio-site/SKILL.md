---
name: portfolio-site
description: Use when building, redesigning, extending, or deploying Marcus Sinclair's portfolio website (this repo), or when starting a similar personal/BI-analyst portfolio site from scratch. Captures the design system, content strategy, deployment setup, and technical patterns (live-dashboard embedding, headless-browser screenshot automation, image handling) established while building this site.
---

# Portfolio site — design system & working knowledge

## What this site is

A static, no-build-step HTML/CSS/vanilla-JS portfolio for Marcus Sinclair, a Business
Intelligence Analyst (Power BI, SQL, Python, statistics). It replaced a generic HTML5UP
template. Deliberately has zero dependencies (no jQuery, no Font Awesome, no framework) —
just `index.html`, `assets/css/style.css`, `assets/js/main.js`.

## Deployment topology

- This repo's root **is** the GitHub Pages site root: `github.com/Marcus07957/Marcus07957.github.io`,
  served directly from `main` — no build step, no `docs/` folder needed.
- `_config.yml`, `docs/_config.yml`, `docs/index.md` exist on the remote as leftover Jekyll
  theme-picker boilerplate from before the static site took over. They aren't pulled locally
  and aren't used by the live site — safe to ignore, or delete from the remote if tidying up.
- Individual project source files (notebooks, PDFs, `.sql`, `.pbix`) live in a **separate**
  repo, `github.com/Marcus07957/PortfolioProjects` — project cards link out there, and the
  site's own GitHub link (nav + contact) points at that repo, not the profile page.
- Workflow: iterate locally (`python -m http.server 8080` from repo root), get the user's
  sign-off in-browser, only then commit and push to `origin/main`.

## Design system

- **Accent color**: solid purple `#7c3aed` (`--color-accent`) used for links, icons, tags,
  eyebrow labels — everywhere, all the time.
- **Brand gradient**: `--gradient-brand` (purple → pink → orange) is reserved for exactly two
  kinds of moments — the emphasis span in the hero headline, and the 1–2 highest-priority CTA
  buttons (nav "Get in touch" + hero "View Projects"). Do **not** spread it across every
  button/card — the restraint is what makes it read as premium rather than gaudy (this is the
  actual lesson from the inzata.ai reference the user pointed at: they use a flashy gradient
  in exactly one or two places per screen, solid brand color everywhere else).
- **Typography**: Inter, 800-weight for the hero headline, tight letter-spacing
  (-0.02em to -0.03em) for a confident/bold feel.
- **Hero layout**: centered — kicker pill ("Open to new opportunities") → big headline →
  subtext → CTA row → social icons → a "browser chrome" product mockup below the fold.
- **Cards/thumbnails**: use `object-fit: scale-down` on real `<img>` tags, never
  `background-size: cover` on a div. `cover` crops anything that isn't the exact target aspect
  ratio (a portrait-orientation poster image was reduced to a sliver) and stretches low-res
  screenshots into visible blur on HiDPI screens. `scale-down` never upscales past native
  resolution and never crops — matte the image on a neutral background instead of forcing it
  to fill the box edge-to-edge.
- **"Browser chrome" mockup**: mac-style traffic-light dots + centered URL pill + screenshot
  underneath. Good generic device any time you want to showcase a live, web-based tool inside
  a hero or featured card.

## Content strategy

- Started from ~20 flat, uncategorized project entries. Decision (confirmed with the user via
  AskUserQuestion, don't skip this step for future content decisions): curate + categorize
  into **BI Dashboards / SQL / Python & ML / Academic & Statistics**, feature ~4 standouts
  spanning categories at the top, put the rest in a filterable grid
  (`data-category` attribute + JS filter-button toggling).
- Live Power BI dashboards are **lazy-loaded into a single shared modal** on click
  (`data-embed="<url>"` attribute), never embedded directly on page load — avoids loading
  10+ heavy iframes simultaneously on first paint.

## Screenshot automation for live/JS-rendered pages

Headless Chrome can capture a true render of a page — including canvas/WebGL-heavy embeds
like Power BI reports — which is how the 11 live-dashboard thumbnails on this site were
produced (visit the actual `app.powerbi.com/view?r=...` URL, screenshot the first page shown).
Useful any time a project needs a thumbnail of a live, JS-rendered report and there's no
static export available.

PowerShell command pattern:

```powershell
Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--headless=new","--disable-gpu","--hide-scrollbars", `
    "--window-size=1600,1000","--user-data-dir=<unique-temp-dir>", `
    "--no-first-run","--screenshot=<out.png>","--virtual-time-budget=12000", `
    "--no-sandbox","<url>" `
  -PassThru -Wait -NoNewWindow
```

Gotchas learned the hard way — both produce the exact same misleading error,
`Multiple targets are not supported in headless mode`:

1. **Give every invocation its own `--user-data-dir`.** Reusing the default profile (or
   re-running back-to-back without one) trips this error.
2. **The `--screenshot=<path>` output path must not contain spaces.** `Start-Process
   -ArgumentList` doesn't reliably protect `--flag=C:\Path With Spaces\file.png` as a single
   argument, so Chrome sees extra positional args and thinks it's been asked to open multiple
   targets. Write to a space-free scratch path first, then copy into the final destination
   (which may legitimately contain spaces, e.g. this repo lives under
   `C:\Claude Code\Portfolio Website\`).
3. Use `--headless=new` (not legacy headless) — canvas/WebGL-based charts need it to render
   at all.
4. `--virtual-time-budget` of 8000–12000ms gives JS-heavy embeds time to finish rendering
   before the screenshot fires.

## Open items / things to revisit

- No contact email is wired up anywhere on the site (only LinkedIn/GitHub). One academic
  project PDF surfaces `mm18ms@leeds.ac.uk`, but that's a university student address and
  likely inactive — confirm a current email with the user before adding a `mailto:` link.
- Old, now-unreferenced screenshot files (`Calls.PNG`, `Tickets.PNG`, `Tracker.PNG`,
  `Commission.PNG`, `CSQ.PNG`) are still sitting in `images/` — candidates for deletion next
  time the repo gets tidied.
