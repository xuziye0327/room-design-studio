# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Code formatting

Oxfmt handles formatting; Oxlint handles code checks. Formatting uses two-space
indentation, single quotes, and semicolons only where required.

```bash
bun install
bun run format        # Format project files
bun run format:check  # Check formatting (suitable for CI)
bun run lint          # Run Oxlint
```

Installation runs `prepare` to register Husky's Git hooks. On `git commit`,
`lint-staged` formats matching staged files and stages the results automatically.
Unstaged edits in partially staged files are preserved. Formatting failures block
the commit. Run `bun run prepare` if hooks need to be registered manually.

Formatting excludes `public/` assets, `.agents/`, `.venv/`, `AGENTS.md`, lockfiles,
and files ignored by Git. The tooling requires Node.js 22.22.1 or newer.

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
