# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## Deployment (GitHub Pages) ⚙️

This repository includes a GitHub Actions workflow that builds the app and deploys the `dist` output to GitHub Pages.

How it works:

1. The workflow runs on push to `main` (and can be manually triggered).
2. The build step honors the `VITE_BASE_PATH` environment variable so the app works when served from a path like `https://<owner>.github.io/<repo>/`.
3. The workflow uploads `./dist` and deploys it using the official Pages actions.

Notes:

- The workflow sets `VITE_BASE_PATH` automatically to `/<repo>/`. If you need a different base path, set `VITE_BASE_PATH` in the workflow or in your build environment.
- After the first successful run you can find your site at `https://<owner>.github.io/<repo>/` (replace `<owner>` and `<repo>` accordingly).
