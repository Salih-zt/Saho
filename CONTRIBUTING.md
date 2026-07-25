# Contributing to SAHO

Thank you for choosing to contribute to SAHO! Below are the guidelines and coding conventions required to maintain the production-grade quality of the application.

## Coding Standards & Principles

1. **SOLID Principles**: Always write modular, reusable, single-responsibility code. Keep presentation views detached from database/logic files.
2. **Strict TypeScript**: Never use `any` unless absolutely necessary for low-level SDK bindings. Type all component props, API parameters, and store states.
3. **Feature-First Folder Layout**: New features must live inside their own subdirectory within `src/features/` with isolated containers and components.
4. **Calm Design Aesthetics**: Keep the UI simple, calming, and clutter-free. Never display more than three primary options on one screen. Ensure touch targets are at least 48x48px.
5. **Accessibility by Default**: Support WCAG 2.2 AA. Utilize ARIA attributes, semantic headings (`h1` to `h5`), and support prefers-reduced-motion out of the box.

## Git Conventions & Quality Gates

* **Conventional Commits**: Commit messages must follow the standard convention:
  * `feat: ...` for new features
  * `fix: ...` for bug fixes
  * `test: ...` for adding tests
  * `docs: ...` for documentation updates
* **Quality checks**: Before creating a pull request, ensure the following commands pass:
  ```bash
  npm run build # TypeScript & build compilation check
  npm run test  # Run unit test suites
  ```
