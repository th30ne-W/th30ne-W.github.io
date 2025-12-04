# th30ne-W.github.io

Personal site for William Nunes showcasing automation-focused IT work. Static Jekyll 3.9 site served via GitHub Pages.

## Requirements
- Ruby 2.7+ with Bundler
- No Node toolchain; Jekyll handles Sass/Markdown
- Install gems into `vendor/bundle` for GitHub Pages parity

## Quickstart
1. bundle install --path vendor/bundle
2. bundle exec jekyll serve --livereload --incremental
3. Browse http://127.0.0.1:4000 and edit content; the server rebuilds on change

## Build and Validate
- bundle exec jekyll build writes the production site to `_site/`
- Run before pushing to catch Liquid/front matter errors

## Content and Data
- Site meta: `_config.yml` controls `title`, `subtitle`, `description`, `url`, `baseurl`, and nav labels under `nav`.
- Home page (`index.md`):
  - Front matter uses `layout: home`, `title`, `description`, `image`.
  - Hero image references `/assets/images/...` plus optional light/dark variants via `data-theme-image-dark` and `data-theme-image-light` attributes.
  - Update the headline and tagline in the markdown body below the front matter.
- About page (`about.md`):
  - Front matter drives the page; update `greeting`, `summary`, `sys_admin_skills`, `other_skills`, `experience`, and `education`.
  - Skill lists expect `name` and `percentage` strings; experience entries use `role`, `dates`, `location`; education uses `school`, `dates`, optional `detail`.
- Projects page (`_data/projects.yml`):
  - Cards render from this YAML file, not from `projects.md`.
  - Example entry:
    ```yaml
    - title: My Project
      description: What it does
      tags: "#Python #Automation"
      url: https://github.com/th30ne-W/my-project
    ```
- Shared chrome:
  - `_includes/header.html` and `_includes/footer.html` for nav/footer tweaks.
  - Layout shells live in `_layouts/` (default, home, about, projects).
- Assets:
  - Styles in `assets/css/main.scss`; Jekyll outputs `assets/css/main.css`.
  - JS interactions in `assets/js/scripts.js`; images in `assets/images/`.
- Custom domain:
  - Keep `CNAME` aligned with `_config.yml` `url`/`baseurl`.

## Repository Layout
- `index.md`, `about.md`, `projects.md`: root pages with front matter.
- `_data/projects.yml`: project data source.
- `_layouts/`: page templates; `_includes/`: shared components.
- `assets/css/main.scss`: primary styles; `assets/js/scripts.js`: client scripts.
- `vendor/`: Bundler vendor directory committed for GitHub Pages compatibility.

## Contribution and Conventions
- Run all commands with `bundle exec` to use the pinned Jekyll 3.9 toolchain.
- Avoid manual edits in `vendor/`; let Bundler manage dependencies.
- Follow conventional commits (e.g., `feat: ...`, `fix: ...`).

## Troubleshooting
- If `jekyll serve` fails, rerun `bundle install` and then `bundle exec jekyll build` for clearer errors.
- Remove `--incremental` when troubleshooting stale rebuilds.
