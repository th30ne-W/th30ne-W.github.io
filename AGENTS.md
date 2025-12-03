# Repository Guidelines

## Project Structure & Module Organization
- Root pages (`index.md`, `about.md`, `projects.md`) use front matter (`layout`, `title`, `description`, `image`). Navigation labels live in `_config.yml` under `nav`.
- Layouts sit in `_layouts/` (default/home/about/projects). Shared chrome in `_includes/header.html` and `footer.html`. Projects page loops over `_data/projects.yml`.
- Styles live in `assets/css/main.scss`; let Jekyll compile it to `assets/css/main.css`. Scripts for animations/interactions are in `assets/js/scripts.js`; images in `assets/images/`.

## Build, Test, and Development Commands
```sh
bundle install --path vendor/bundle   # Install Ruby/Jekyll deps locally
bundle exec jekyll serve --livereload --incremental  # Local dev at http://127.0.0.1:4000
bundle exec jekyll build              # Production build to _site/
```
Use Bundler (`bundle exec ...`) so the pinned Jekyll 3.9 toolchain stays consistent.

## Coding Style & Naming Conventions
- HTML/Liquid: 4-space indentation; keep includes lean and reusable. Prefer include tags (e.g., `{% raw %}{% include header.html %}{% endraw %}`) or data files over repeated markup.
- Sass: edit `main.scss` (keep variables in `:root`), let the pipeline generate `main.css`. Group related blocks and respect the existing neon theme palette.
- Content: front matter keys are lowercase with hyphens; titles in Title Case. Data entries in `_data/projects.yml` follow `title`, `description`, `tags`, `url`.

## Testing Guidelines
- There is no automated test suite; rely on `bundle exec jekyll build` to catch Liquid/front matter errors.
- Manually spot-check pages via `bundle exec jekyll serve` for navigation links, project cards, and the background animation behavior.
- If you add plugins or new layouts, validate for build warnings and broken links before opening a PR.

## Commit & Pull Request Guidelines
- Commit messages mirror conventional commits seen here (e.g., `feat: ...`, `fix: ...`, `chore: ...`). Keep commits scoped and descriptive.
- PRs should summarize the change, list impacted pages/assets, and note any data updates (e.g., `_data/projects.yml`). Attach screenshots or GIFs for UI tweaks.
- Link related issues when available and confirm the site builds locally (`bundle exec jekyll build`).

## Security & Configuration Tips
- Do not commit secrets or API keys; this site is static and public. Custom domain is set via `CNAME`; keep `url`/`baseurl` in `_config.yml` aligned with deployment.
- Vendor directory is committed for GitHub Pages compatibility; avoid manual edits; let Bundler manage it.
