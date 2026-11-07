# 12-Point Pre-Flight Verification Checklist

Platform: Karmatix Learning
Target URL: https://learn.karmatix.in
Audited: November 7, 2026

1. Viewport Budget: PASS
   Primary CTA "View courses" and "Start with .NET" render above the fold on 360x640 mobile viewports without requiring vertical scroll. Top padding capped at 2rem on mobile.

2. Typography & Font Performance: PASS
   Self-hosted Geist (sans) and Geist Mono (monospace) variable fonts served locally from `/public/fonts/` as WOFF2 (28 KB and 31 KB). Zero external Google Fonts or CDN requests.

3. Color Hierarchy & Contrast: PASS
   Single dark theme with background `#0b0f19` and locked Cobalt accent `#2563eb` with accessible light tint `#60a5fa`. All text meets or exceeds WCAG AA 4.5:1 contrast requirements. Zero outer neon glows or warm/cool grey mixing.

4. Layout Rhythm & Bento Geometry: PASS
   Asymmetric hero split. Bento grid contains exactly 5 cards matching the 5 items in `courses.json` with zero empty filler cells. Distinct sticky pillar architecture in The Karmatix Standard.

5. Zero Em-Dash & En-Dash Policy: PASS
   Automated check via `scripts/check-dashes.mjs` confirmed zero em-dashes (`\u2014`) and zero en-dashes (`\u2013`) across all HTML, Astro, CSS, JSON, and JavaScript source files.

6. Truthful Copy & Zero Buzzwords: PASS
   Copy strictly avoids prohibited filler ("revolutionary", "unlock", "supercharge", "seamless", "elevate", "journey"). All facts are stated plainly with evidence links.

7. Single Source of Truth: PASS
   `src/data/courses.json` governs all card displays and JSON-LD structured data. Validated by `scripts/validate-courses.mjs`. Every stat cites its verifiable source.

8. Performance & Asset Budget: PASS
   Fully static HTML. External JavaScript bundle size is 0.00 KB (well below 30 KB gzipped ceiling). Images optimized in modern AVIF and WebP with explicit width and height dimensions.

9. Accessibility & Semantics: PASS
   Single `<h1>` element, skip-to-content landmark, semantic `<header>`, `<main>`, `<footer>`, `<nav>`, and `<details>/<summary>` FAQ blocks. Minimum 44px mobile tap targets.

10. Reduced Motion Guarantee: PASS
    Global `@media (prefers-reduced-motion: reduce)` rule cancels all transforms and animations. Visualized and verified in `docs/qa/viewport-reduced-motion.png`.

11. Privacy & Legal Compliance: PASS
    Zero third-party trackers, zero cookies, and zero external analytics scripts. Privacy Policy drafted under India's DPDP Act principles. Full Microsoft Corporation and Google LLC trademark disclaimers included.

12. Legacy Route & Deep Link Protection: PASS
    Smart `404.html` client redirect forwards legacy `/module-*`, `/career`, `/cheatsheets`, and other bookmarked .NET paths directly to `https://dotnet.karmatix.in`.
