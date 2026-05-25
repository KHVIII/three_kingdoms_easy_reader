# Three Kingdoms Easy Reader

A static, frontend-only reading app for 三国演义 (Romance of the Three Kingdoms). Designed for modern Chinese readers who want to engage with the classical text — click any character to see its pinyin pronunciation. The UI supports bilingual display (Chinese/English), toggleable by the user.

## Stack

- **Framework**: Next.js with `output: 'export'` (fully static, no server)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Pronunciation**: `pinyin-pro` (client-side, no API calls)
- **Content**: Flat JSON files in `/content`, with pinyin pre-baked at build time
- **Hosting**: GitHub Pages

## Architecture

This is a zero-backend project. All content is bundled at build time. Pinyin is pre-processed into the content JSON during the build step so the browser only does lookups, not computation.

If a backend ever becomes necessary, it must be scoped to a single Next.js API route or Cloudflare Worker. Do not introduce a separate server or database.

## Project Structure

```
/content              # Source chapter text (raw Chinese, one file per chapter)
/scripts              # Build-time scripts (e.g. pinyin pre-processor)
/public               # Static assets (fonts, icons, PWA manifest)
/src
  /app                # Next.js App Router pages
  /components         # UI components
  /lib                # Utilities (content loader, i18n helper, etc.)
  /messages           # UI strings — zh.json and en.json
```

## Dev Commands

```bash
npm run dev           # Dev server at localhost:3000
npm run build         # Static export to /out (runs pinyin pre-processor first)
npm run lint          # ESLint
npm run process-text  # Standalone: re-run pinyin pre-processor on /content
```

## Key Conventions

- **Static export only** — never use runtime server features (`getServerSideProps`, server actions requiring Node, dynamic API routes). Everything must work as flat HTML/CSS/JS files.
- **Pinyin at build time** — pinyin data lives in the content JSON, not computed on click. Click handlers do a lookup, not a `pinyin-pro` call at runtime.
- **i18n is lightweight** — UI language toggle uses a simple React context + `/messages/zh.json` and `/messages/en.json`. Do not introduce a heavy i18n library.
- **Chinese fonts** — default to system CJK fonts. Do not bundle a Chinese font unless there is a specific rendering problem that cannot be solved otherwise.
- **PWA-ready** — the app should work offline once loaded. Keep this in mind when fetching content: prefer bundled data over runtime fetches.
- **No comments explaining what code does** — only add a comment when the *why* is non-obvious (a constraint, a workaround, a subtle invariant).

## Hosting & Deployment

Deployed to GitHub Pages via static export. The `/out` directory is the deployable artifact. The site must work when opened as a local file (`file://`) to support offline use on mobile.
