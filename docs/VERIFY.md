# Verification and Operational Checklist

## 1. Verified Course Data Sources
All statistics and metadata rendered on the Karmatix Learning landing page were verified directly against their official repositories on November 7, 2026:

- **Karmatix .NET Academy**:
  - Modules: 12 (verified in `dotnet-academy/content/lessons/` and curriculum overview)
  - Framework Target: .NET 10 LTS, C# 14 (verified in `dotnet-academy/samples/global.json`)
  - Tested Projects: 16 (verified in `dotnet-academy/samples/` including Capstones and Labs)
  - Interview Questions: 200+ (verified in `dotnet-academy/site/src/content/career/interviewQuestions.ts`)
  - CI Status: Every C# sample compiled with `-warnaserror` in GitHub Actions CI workflow

- **Karmatix Flutter Course**:
  - Curriculum Modules: 10 (verified in `flutter-course/content/` and `src/data/curriculum/`)
  - Timed Mock Exams: 5 (100 total questions verified in `flutter-course/src/data/exam/mockTests.ts`)
  - Calculation Labs: 20+ commercial bill and discount calculation problems (verified in `flutter-course/src/data/exam/discountProblems.ts`)
  - Platform Scope: Dart 3 & Flutter 3 with native Android Kotlin side-by-side comparisons

- **Upcoming Roadmap**:
  - Cloud and DevOps Architecture: Marked `planned` (no fake dates)
  - AI and Python for Production: Marked `planned` (no fake dates)
  - Distributed Systems and Microservices: Marked `planned` (no fake dates)

---

## 2. Manual Action Items for Launch

1. **DNS and GitHub Pages Cutover (Execute in this exact order)**:
   - Step A: In repository `Karma-tic/dotnet-academy`, change custom domain from `learn.karmatix.in` to `dotnet.karmatix.in`. Update Cloudflare/DNS with a CNAME record: `dotnet` pointing to `karma-tic.github.io`. Ensure HTTPS certificate is approved and enforced.
   - Step B: In repository `Karma-tic/karmatix-learn`, set custom domain to `learn.karmatix.in`. Cloudflare/DNS record `learn` points to `karma-tic.github.io`.
   - Step C: Enable "Enforce HTTPS" in GitHub Pages settings for `karmatix-learn`.
   - Step D: Verify that visiting `learn.karmatix.in/module-1/` automatically redirects to `https://dotnet.karmatix.in/module-1/`.

2. **Brand Assets**:
   - Swap `public/brand/wordmark.svg` with your final official Karmatix vector mark.
   - Swap `public/favicon.svg` with your finalized favicon if desired.

3. **Legal Review**:
   - Review `/privacy` and `/terms` with legal counsel before official public promotion.

4. **Search Console Onboarding**:
   - Add property `https://learn.karmatix.in` in Google Search Console (Domain property or URL prefix).
   - Submit sitemap: `https://learn.karmatix.in/sitemap-index.xml`.
   - Submit URL prefix in Bing Webmaster Tools.

5. **Cross-Linking from karmatix.in**:
   Add this HTML snippet to your primary navigation on `https://karmatix.in`:
   ```html
   <a href="https://learn.karmatix.in" title="Free Engineering Courses">Learning</a>
   ```

