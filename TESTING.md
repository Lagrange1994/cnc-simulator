# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your
instincts, and ship with confidence — without them, vibe coding is just yolo coding. With
tests, it's a superpower.

## Framework

Vitest + React Testing Library, running in jsdom.

## Running tests

```bash
npm test
```

## Test layers

- **Unit/component tests** — colocated with source as `*.test.tsx` next to the component
  it covers (e.g. `components/Sidebar.test.tsx`). Written for components with real logic:
  conditional rendering, disabled states, callbacks firing on interaction.
- **Integration tests** — not yet present. Add under `test/integration/` if flows spanning
  multiple components need coverage (e.g. cycle start → simulation progress → reset).
- **Smoke tests** — not yet present.
- **E2E tests** — not yet present. Consider Playwright if end-to-end browser coverage
  becomes necessary.

## Conventions

- File naming: `ComponentName.test.tsx`, colocated with the component.
- Assertions: `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toBeDisabled`, etc).
- Interaction: `@testing-library/user-event`, never fire raw DOM events directly.
- Setup: `test/setup.ts` registers jest-dom matchers globally via `vitest.config.ts`.
