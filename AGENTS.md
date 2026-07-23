# CoBlog Project Rules

## Project
- Name: `coblog`
- Date: `2026-07-23`
- Stack: `Vue 3`, `Vite`, `TypeScript`, `NestJS`, `MongoDB`, `Mongoose`, `Element Plus`
- Package manager: `pnpm`

## Structure
- `apps/client`: frontend application
- `apps/server`: backend application
- `deploy`: deployment config
- `docs`: project docs

## Current Priorities
- Remove unnecessary monorepo complexity.
- Fix high-risk backend security and engineering issues before adding new AI features.
- Keep changes scoped and avoid unrelated refactors.

## Working Rules
- Read existing server and client boundaries before changing architecture.
- Prefer root-cause fixes over UI-only or prompt-only patches.
- Security-sensitive changes must not read or expose real secrets from `.env`.
- Validate with type check or targeted command when feasible.
