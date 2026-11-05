# fw-dew-starter

A starter repository for the Freshworks [Dew](https://github.com/freshworks/fw-dew) design system. On `pnpm install`, it pulls the current **`latest`** of the Dew packages from the [public npm registry](https://www.npmjs.com).

## Packages

| Package | Source |
| --- | --- |
| `@freshworks/dew-components` | [npm](https://www.npmjs.com/package/@freshworks/dew-components) (`latest`) |
| `@freshworks/dew-styles` | [npm](https://www.npmjs.com/package/@freshworks/dew-styles) (`latest`) |
| `@freshworks/dew-theme-generator` | [npm](https://www.npmjs.com/package/@freshworks/dew-theme-generator) (`latest`) |
| `@freshworks/dew-mcp-server` | [npm](https://www.npmjs.com/package/@freshworks/dew-mcp-server) (`latest`) |

## Quick start

### 1. Clone this repository

```sh
git clone <this-repo-url>
cd fw-dew-starter
```

### 2. Install dependencies

Use **pnpm** so Dew packages refresh to the current `latest` after install:

```sh
pnpm install
```

A project [`.npmrc`](.npmrc) pins `@freshworks` to `https://registry.npmjs.org/` so installs do not use GitHub Packages even if your global npm config does.

After the main install, a `postinstall` script runs `pnpm update … --latest` for the four Dew packages so a committed lockfile does not leave you on stale versions. To skip that refresh (for example in CI with a frozen lockfile):

```sh
DEW_SKIP_LATEST=1 pnpm install
```

### 3. Use the packages in your app

```tsx
import '@freshworks/dew-styles/colors.css';
import '@freshworks/dew-styles/numbers.css';
import '@freshworks/dew-styles/fonts.css';
import '@freshworks/dew-components/assets/dew-cmp-reset.css';
import '@freshworks/dew-components/assets/dew-cmp-lib.css';

import { TextButton, TextField } from '@freshworks/dew-components';
```

`@freshworks/dew-components` requires **React 17+** as a peer dependency. Install React in your application if it is not already present:

```sh
pnpm add react react-dom
```

## Demo app

This repo ships a small Vite + React app that consumes the Dew packages so you can see them in action immediately.

```sh
pnpm install
pnpm dev
```

Then open the dev server URL (default http://localhost:5173). Routes:

- `/` — a **component overview** gallery showcasing real `@freshworks/dew-components` (buttons, tags, badges, avatars, banners, inline messages, selection controls, accordion) rendered with Dew semantic tokens.
- `/freshservice` — a **Freshservice app shell** demo (rail navigation, top navigation, breadcrumb/search, and a Dashboard landing screen), imported from a Figma Make design. The overview page links to it via a prominent card.

Other scripts:

```sh
pnpm build     # type-check (tsc) and produce a production build in dist/
pnpm preview   # preview the production build locally
```

The app loads Dew styles from the installed packages in [src/styles/index.css](src/styles/index.css) and applies the `dew-light-theme` token class on the root `<html>` element (see [index.html](index.html)).

## Adding Dew to your own project

```sh
pnpm add @freshworks/dew-components @freshworks/dew-styles
```

If your machine has `@freshworks` pointed at GitHub Packages, add this to your project `.npmrc` so installs use the public registry:

```properties
@freshworks:registry=https://registry.npmjs.org/
```

## Optional: Dew MCP server

`@freshworks/dew-mcp-server` provides an MCP server for Dew component documentation and tooling. After install, you can run it via:

```sh
pnpm exec dew-mcp
```

Configure it in your editor's MCP settings according to your team's setup.

## Requirements

- **Node.js** v18 or later
- **pnpm** v9+ (required — the postinstall Dew `latest` refresh only runs under pnpm)
