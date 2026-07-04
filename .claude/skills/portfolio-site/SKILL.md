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

## GitHub Pages deployment & debugging

- Deployment is **Actions-based**, not the legacy branch-serving mode: every push to `main`
  triggers a "pages build and deployment" workflow with three jobs — `build` (runs Jekyll even
  though this is a static site; GitHub Pages always Jekyll-processes unless a `.nojekyll` file
  exists at the root — harmless here, but explains why a Jekyll build step shows up in the
  logs), `report-build-status`, and `deploy` (the `actions/deploy-pages` action).
- This repo has no `gh` CLI installed and no `GITHUB_TOKEN` env var, so debugging happened over
  the plain REST API with `curl`:
  - `GET /repos/<owner>/<repo>/actions/runs` — list recent runs with `status`/`conclusion` per
    commit SHA (compare against `git log` to line up which push produced which result).
  - `GET /repos/<owner>/<repo>/actions/runs/<run_id>/jobs` — per-job/per-step pass-fail
    breakdown, to see *which* stage actually failed (build vs deploy).
  - `GET /repos/<owner>/<repo>/actions/jobs/<job_id>/logs` — full step logs, but this endpoint
    401s for anonymous/unauthenticated requests even on a public repo. Fix: pull a cached
    credential with `printf 'protocol=https\nhost=github.com\n\n' | git credential fill` (Git
    Credential Manager already had one from the earlier `git push`) and send it as
    `Authorization: Bearer <token>` — no need to ask the user for a PAT.
- **What the failure actually was**: the `build` job succeeded completely (Jekyll build,
  artifact upload all green); the `deploy` job's `actions/deploy-pages@v5` step created the
  deployment fine but then hit `##[error]Deployment failed, try again later.` — GitHub's own
  generic transient infrastructure error at the final activation step. It was not caused by
  anything in the commit. Confirmed because a follow-up commit with a **byte-for-byte identical
  tree** (the user's manual "Add files via upload" re-push of the same content) deployed
  successfully on the very next attempt.
- **Lesson**: when a Pages deploy fails, check the Actions run logs before assuming the
  redesign/code is at fault — a `build: success` + `deploy: failure` combo with a "try again
  later" message means "just retry" (re-push, even an empty commit), not "debug the HTML/CSS."
- If the user manually re-uploads/re-pushes while you're mid-debug, local `main` and
  `origin/main` will diverge (different commit SHAs, e.g. `Add files via upload`). Before
  force-pushing or re-committing, check `git diff --stat main origin/main` — if empty, it's the
  same content, so just `git fetch` + `git merge --ff-only origin/main` to catch the local repo
  up rather than fighting the history.
- **Git identity**: this repo had no `user.name`/`user.email` configured, and the global
  Git Safety Protocol here is "never touch git config" — so when a commit was needed, the
  right move was to ask the user how they wanted commits attributed (not silently default to
  anything), then set **repo-local** (not `--global`) identity. The user picked the GitHub
  noreply format; get the numeric user id via `curl https://api.github.com/users/<username>`
  (public, no auth needed) and build `<id>+<username>@users.noreply.github.com` — don't guess
  the bare `<username>@users.noreply.github.com` form, GitHub's real generated address includes
  the id prefix.

## Open items / things to revisit

- No contact email is wired up anywhere on the site (only LinkedIn/GitHub). One academic
  project PDF surfaces `mm18ms@leeds.ac.uk`, but that's a university student address and
  likely inactive — confirm a current email with the user before adding a `mailto:` link.
- Old, now-unreferenced screenshot files (`Calls.PNG`, `Tickets.PNG`, `Tracker.PNG`,
  `Commission.PNG`, `CSQ.PNG`) are still sitting in `images/` — candidates for deletion next
  time the repo gets tidied.
