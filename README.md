# Karmatix Learn

**https://learn.karmatix.in** is a hand-picked map of what to learn, where to practise and who to learn with. It does not re-teach topics. It points developers to the best existing courses, practice platforms, certifications, YouTube channels, tools and communities, in an order that works, and says how to use each one.

Built with Astro as a static site. No accounts, no trackers, no affiliate links.

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321

# The same checks CI runs
node scripts/check-dashes.mjs
npm run lint:courses
npm run lint:data
npm run build
npm run test:links
npm run test:a11y
npm run test:external   # needs internet; checks every outbound link
```

## How the site is organised

| Page | Source |
|---|---|
| Home, with the "I want to become a" picker | `src/pages/index.astro` |
| 8 paths, each with 4 stages | `src/data/paths.json`, rendered by `src/pages/paths/[id].astro` |
| Resource directory with filters | `src/data/resources.json`, rendered by `src/pages/resources/index.astro` |
| Stack roadmaps with skill checklists | `src/data/roadmaps.json`, rendered by `src/pages/roadmaps/[id].astro` |
| Certifications with fees and verdicts | `src/data/certifications.json` |
| Connect with developers | `src/pages/connect/index.astro` (lists resource ids) |
| Karmatix's own courses | `src/data/courses.json` |

Everything a visitor sees about a resource comes from one entry in `resources.json`, so a fix in one place updates every page.

## Playbook

### Add a resource

Add an entry to `src/data/resources.json`:

```json
{
  "id": "short-kebab-id",
  "name": "Display name",
  "by": "Creator or organisation",
  "url": "https://...",
  "type": "course",
  "cost": "free",
  "price": null,
  "tracks": ["backend"],
  "level": "beginner",
  "lang": "en",
  "india": false,
  "why": "One sentence on why it earns a place. Under 160 characters.",
  "tip": "One practical instruction on how to use it. Under 170 characters."
}
```

- `type`: course, practice, docs, video, roadmap, tool, community, program, newsletter, podcast, jobs, book
- `tracks`: core, frontend, backend, mobile, cloud, ai, data, dsa, security
- `cost`: free, freemium (free tier) or paid. `lang`: en, hi or hi-en.

A pick must be current, used by working developers, and practical (you build or solve something with it). No affiliate links.

### Put it in a path

In `src/data/paths.json`, add the id to a stage's `learn` or `practise` list (not both), or to the path's `tools`, `channels`, `communities` or `jobs`. Use `hint` on a stage when it lists alternatives ("pick one framework").

### Update certification fees

Edit `fee`, `feeIndia`, `validity` and `note` in `src/data/certifications.json`, then update `LAST_CHECKED` in `src/lib/data.ts`. Use the official exam page as the source.

### Stack roadmaps

`src/data/roadmaps.json` holds one roadmap per tech stack, rendered at `/roadmaps/<id>/`. Each stage has a `topics` checklist (the skills), `learn` and `practise` resource ids, `build`, `prove` and an optional `hint`. The Flutter and .NET course sites show the same roadmap. After editing either one, re-export it:

```bash
node scripts/export-roadmap.mjs flutter ../flutter-course/src/data/roadmap.generated.ts
node scripts/export-roadmap.mjs dotnet ../dotnet-academy/site/src/content/roadmap.generated.ts
```

### Writing rules

- No em or en dashes anywhere (CI fails on them). Use commas, colons or hyphens.
- Plain, specific language. Say what to do, not how amazing something is.

## CI

- **CI Quality Gate** (every push and PR): dash check, course and data validation, build and type check, internal link check, accessibility and JS budget. PRs also get a non-blocking report of external links.
- **Weekly external link check** (Mondays, or run it by hand): flags any resource link that has died.
- **Deploy**: pushes to `main` deploy to GitHub Pages.

## Legal

Names and logos of courses, platforms and certifications belong to their owners. Karmatix Learn is independent and is not affiliated with, endorsed by or paid by any of them. .NET, C#, Azure and Visual Studio are trademarks of Microsoft Corporation. Flutter and Dart are trademarks of Google LLC.
