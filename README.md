# barber-saas-platform-admin-app

> platform-admin bounded context: mobile UI (remote)

Part of the **Barber Saas** distributed system — team `barber-saas`, Grupo 2.
Governance and documentation live in [`barber-saas-docs`](https://github.com/code-corhuila/barber-saas-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `barber-saas-docs`.

---

## BarberSaaS — what this repository is

The `SUPER_ADMIN` screens of BarberSaaS: an **Ionic Angular** domain app (ADR-013) loaded by the
Angular shell (`barber-saas-front`) at `/platform`. It is also the **reference Angular domain app**:
`notifications-app`, `loyalty-app` and `finance-inventory-app` start by copying it.

| Screen | Calls (`platform-admin-service.yaml` 1.2.0) |
|---|---|
| Barbershops: all of them, filtered by status (FR-023) | `GET /api/v1/platform/barbershops` |
| Barbershop: trial, plan, activate / suspend / cancel (FR-025) | `GET …/barbershops/{id}`, `…/trial`, `PATCH …/status`, `PUT …/plan` |
| Plans: list, create, edit, deactivate (FR-024) | `/api/v1/platform/plans` |

```
federation.config.js        exposes './routes' only; Angular and Ionic shared as singletons
src/app/platform.routes.ts  the routes the shell mounts under /platform (every screen lazy)
src/app/shell-context.ts    the contract with the shell (copied, never imported)
src/app/platform/           calls (platform-calls.ts), rules, types and the screens
src/app/ui/                 the four states of every view and the shared styles
src/main.ts, bootstrap.ts   only when opened alone: a notice that it runs inside the shell
```

### How an Angular domain app works (copy this)

- **It exposes its routes**, not a mount function: `exposes: { './routes': … }`. The shell adds one
  entry in `app.routes.ts` (`angularDomain('platform', 'platform-admin', 'Plataforma', ['SUPER_ADMIN'])`)
  and one in `public/federation.manifest.json`.
- **It runs in the shell's injector.** Requests use Angular's `HttpClient` with relative
  `'/api/...'` URLs; the shell's interceptor adds the gateway, the token, `X-Correlation-Id`, the
  timeout and the error shape (`ApiError.userMessage`). **Never** `provideHttpClient()` here (norm
  5.4.1) and never store a token.
- **The session** comes as `data.shell` (`ShellContext`): `shellContext(route.snapshot)` returns
  `session.user()`, `session.barbershopId()`, `session.enterBarbershop(id)` and `navigate(path)`.
- **Same versions as the shell** (Angular ~21.2, Ionic ~8.8, shared as singletons): a different
  version breaks `strictVersion`. Components are standalone and use signals (the shell is zoneless).
- **Tests without TestBed:** the calls live in a class over a small `Http` interface with plain
  params and headers, so Vitest tests them with a fake (`platform-calls.spec.ts`).
- **Dev port:** platform-admin 4308; notifications 4305, loyalty 4306, finance-inventory 4307.

### How to start it

```bash
npm ci
npm start      # ng serve: builds the remote and serves it at http://localhost:4308
```

Then start the shell (`npm start` in `barber-saas-front`) and the platform (`./scripts/up.sh dev`
in `barber-saas-infra-postgres`), sign in as `SUPER_ADMIN` and open `/platform`. For the installed
app, `npm run android:package` in the shell builds and copies this remote too.

### How it is tested

`npm test` (Vitest): the calls against the contract, the lifecycle moves, money and the plan form.
CI also builds the remote. Seen in the Pixel 7 emulator mounted by the shell at `/platform`.
