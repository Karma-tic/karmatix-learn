# Karmatix Learning Catalog

The public engineering course catalog for **Karmatix Learning** (https://learn.karmatix.in).

Built with Astro, static HTML output, self-hosted typography, and zero third-party trackers.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run quality checks (Dash check, course validation, link checker, accessibility)
npm run lint:courses
node scripts/check-dashes.mjs
npm run build
npm run test:links
npm run test:a11y

# Preview built static output
npm run preview
```

---

## 📖 Operational Playbook

### 1. How to Add a New Course
1. Open `src/data/courses.json`.
2. Add a new course entry following the required schema:
   ```json
   {
     "id": "course-id",
     "title": "Course Title",
     "shortTitle": "Short Title",
     "flagship": false,
     "status": "planned",
     "tagline": "One punchy sentence under 15 words.",
     "summary": "Clear summary under 25 words.",
     "audience": "Target engineering audience",
     "level": "Intermediate",
     "topics": ["Topic 1", "Topic 2"],
     "url": "",
     "repoUrl": "https://github.com/Karma-tic/...",
     "stats": [
       { "label": "Status", "value": "In planning", "source": "Curriculum roadmap" }
     ],
     "versions": {},
     "lastVerified": "2026-11-07",
     "badges": ["Planned"],
     "ciVerified": false,
     "image": {
       "desktop": "",
       "desktopAvif": "",
       "mobile": "",
       "mobileAvif": "",
       "alt": "Course preview"
     },
     "codeSnippet": {
       "title": "Sample Snippet Title",
       "language": "python",
       "code": "# Compilable code here"
     }
   }
   ```
3. Run `npm run lint:courses` to verify no dash violations or broken fields exist.

### 2. How to Promote a Course from "Planned" to "Live"
1. In `src/data/courses.json`, change `"status": "planned"` to `"status": "live"`.
2. Add the live production URL in `"url"` (e.g. `https://devops.karmatix.in`).
3. Add verified stats citing their source repository or documentation location.
4. Capture high-resolution desktop and mobile screenshots (place in `/public/images/courses/`).
5. Run `npm run build` and `npm run test:links`. When pushed to `main`, GitHub Actions will rebuild the sitemap, JSON-LD Course schema, and static HTML automatically.

### 3. How to Update Verified Stats
Every statistic displayed on the page must cite its verifiable source in `courses.json`. Never type numbers from memory. When modules or projects are added:
1. Verify the exact count in the course repo.
2. Update the `value` and `source` string in `src/data/courses.json`.
3. Update `lastVerified` to the current date.

### 4. How to Swap the Brand Logo
- Vector Wordmark: Replace `public/brand/wordmark.svg`.
- Favicon: Replace `public/favicon.svg`.
- Social Share Card: Generate a new 1200x630 banner via `node scripts/capture-course-screenshots.mjs` or replace `public/images/og-karmatix-learn.png`.

---

## 🛡️ CI / CD Pipeline

All pull requests and commits to `main` must pass the continuous integration gate:
1. **TypeScript & Astro Check:** `astro check`
2. **Dash Policy:** Fails if any em-dash (`\u2014`) or en-dash (`\u2013`) is found
3. **Course Schema Validator:** Enforces non-empty URLs, word budgets, and verified sources
4. **HTML & Internal Link Audit:** Verifies all images, routes, and in-page anchor targets
5. **Accessibility & JS Budget Audit:** Confirms WCAG AA semantics and checks that gzipped JavaScript is under 30 KB
6. **Automated Deployment:** On `main`, the official GitHub Pages deployment workflow publishes the static artifact to `learn.karmatix.in`.

---

## ⚖️ Legal & Trademarks
.NET, C#, ASP.NET, Azure, and Visual Studio are trademarks of Microsoft Corporation. Flutter and Dart are trademarks of Google LLC. Karmatix Learning is an independent educational publisher and is not affiliated with or endorsed by Microsoft or Google.

