# node-sponsorblock-api

Node module wrapper for the [SponsorBlock](https://sponsor.ajay.app) web API. Published to npm as `sponsorblock-api`. TypeScript source in `src/`, compiled to `lib/` (the only directory shipped in the package).

## Commands

| Command         | What it does                                                       |
| --------------- | ------------------------------------------------------------------ |
| `npm test`      | `mocha -t 30000 -r ts-node/register --recursive tests/**/*.ts`      |
| `npm run build` | `tsc` — runs `prebuild` → `clean` first                             |
| `npm run clean` | `rd /s /q lib` — **Windows only**, see below                        |

The `clean` and `prebuild` scripts use `cmd.exe` syntax (`rd /s /q`, bare `&` chaining). npm runs scripts through `cmd.exe` on Windows regardless of your calling shell, so `npm run build` works locally from bash or PowerShell — but it would fail on Linux or macOS. `npm test` is portable and is what CI runs.

## Testing

Tests are **integration tests against a live server** — `tests/config.ts` constructs a real `SponsorBlock` client pointed at `https://sponsorblock.kavin.rocks` and the specs make real HTTP calls against a fixed video ID. There is no mocking layer.

Consequences to respect:

- Tests need network access and can fail for reasons unrelated to your change (server down, rate limiting, upstream data changed). Distinguish a genuine regression from a flaky upstream before chasing it.
- The 30s mocha timeout exists because of this. Don't lower it.
- Never point tests at the production `https://sponsor.ajay.app` instance, and never write tests that submit or vote on segments — those mutate a real community database.
- Layout: one spec per API method at `tests/cases/<method>.spec.ts`, using mocha `describe`/`it` with chai's `assert` (not `expect`). Shared fixtures come from `tests/config.ts`.

CI (`.github/workflows/test.yml`) runs `npm ci && npm test` on Node 16 and 18, on pushes and PRs to `master` that touch `src/**`, `tests/**`, or `tsconfig.json`.

## Architecture

```
src/
├── index.ts              ← public surface: defaultOptions + re-exports
├── constants.ts
├── utils.ts              ← exported helpers (part of the public API)
├── api/
│   ├── interfaces/       ← SponsorBlockInterface, VIP, Admin — the documented contract
│   ├── impl/             ← classes implementing them: SponsorBlock → VIP → Admin
│   └── utils.ts          ← internal helpers (resolveVideo, statusCheck, …)
├── types/                ← one type per file, grouped by concern
└── errors/ResponseError.ts
```

Conventions that hold across the codebase:

- **Interface / impl split.** Every public class has a matching interface in `api/interfaces/`. TSDoc for a method lives on the *interface*, not the implementation. `SponsorBlockVIP` extends `SponsorBlock` and `SponsorBlockAdmin` extends VIP — permission tiers, widening access.
- **Axios instance per client.** Each client builds `axios.create({ baseURL, validateStatus: null })` in its constructor and stores it as `protected http`. `validateStatus: null` is deliberate: axios never throws on status, and every call instead passes the response through `statusCheck(res)`, which raises `ResponseError` with a `[SponsorBlock]`-prefixed message. Follow that pattern for new endpoints — don't add try/catch around axios or reintroduce status throwing.
- **`Resolvable` parameter types.** Public methods take `VideoResolvable` / `SegmentResolvable` (`string | object`) and normalise via `resolveVideo` / `resolveSegment` on the first line. New methods that accept a video or segment should do the same.
- **Options merging.** User options are spread over `defaultOptions` in the constructor; a trailing `/` on `baseURL` is stripped first.
- **Types are structural aliases**, one per file (`export type VideoID = string`), re-exported through `src/types/index.ts`. No branding, no classes.

## Coding standards

- **Formatting** — `.prettierrc.js`: tabs (width 2), single quotes, `printWidth: 180`, `trailingComma: 'es5'`, CRLF line endings, always-parenthesised arrow params. Prettier is not a devDependency and there's no format script, so match the surrounding style by hand; don't reflow untouched lines.
- **TypeScript** — `tsconfig.json` enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noImplicitThis`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, but **not** full `strict`. Target ES6, CommonJS, `declaration: true`. Unused locals and parameters are allowed.
- **Prefer `const`** for local variables; reach for `let` only when a binding is genuinely reassigned. Existing `src/` code uses `let` almost everywhere — treat that as legacy, not as the target. Convert to `const` on lines you are already changing for another reason; don't open rename-only diffs across untouched files.
- **TSDoc on public API.** Interfaces carry `/** */` blocks with `@param` for each argument, and `@throws {@link ResponseError}` where applicable. `removeComments: false` means these ship in `lib/`, so they are the published documentation.
- **Public API changes are breaking.** `src/index.ts` is the package surface; anything re-exported from it is consumed by downstream users. Adding to it is fine, changing or removing a signature needs a version bump and a note.
- **Don't hand-edit `lib/`** — it's generated by `tsc`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues at `origeva/node-sponsorblock-api`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, using their default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
