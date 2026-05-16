# Translation Helper — UI

Implementation of the **Translation Helper v3** redesign generated in [Claude Design](https://claude.ai/design).

Warm cream foundation grounded in the Shemá design system — telha terracotta accent, Fraunces editorial serif, deep brown text, generous rounded surfaces. Light and dark mode.

## Stack

- Vite + React 18 + TypeScript
- [`wouter`](https://github.com/molefrog/wouter) for routing
- [`lucide-react`](https://lucide.dev) for icons
- CSS variables (`src/styles/theme.css`) — no Tailwind, all styling inline against tokens

## Run — local Node

```
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Run — Docker

**Production** (built static assets served by nginx, port 8080):

```
docker compose up -d        # build + start in background
open http://localhost:8080
docker compose down         # stop + remove
```

Override the host port: `PORT=3000 docker compose up -d`.

**Development** (Vite dev server with hot reload, source mounted, port 5173):

```
docker compose --profile dev up dev
```

Edit files in `src/` and the browser auto-reloads. `CHOKIDAR_USEPOLLING=1` is set so file events work reliably across the bind mount.

**Files:**
- `Dockerfile` — multi-stage build (node:20-alpine → nginx:1.27-alpine). Final image ~76 MB.
- `Dockerfile.dev` — node:20-alpine running `vite --host 0.0.0.0`.
- `nginx.conf` — SPA fallback (`try_files $uri $uri/ /index.html`), gzip on, 30-day immutable cache for hashed assets, no-store for `index.html`.
- `docker-compose.yml` — `app` (prod) is the default service; `dev` is gated behind the `dev` profile so it doesn't start unless asked.

## Routes

| Route | Screen |
|---|---|
| `/` | Welcome — editorial Fraunces hero + main input + inspiration cards |
| `/chat/:chatId?` | Chat — populated thread, voice takeover, mic error states |
| `/login` | Sign in — also handles `?status=pending\|rejected\|approved\|reset` query for alerts |
| `/signup` | Two-step signup |
| `/forgot-password` | Request a password reset link |
| `/reset-password` | Set new password (token from query) |
| `/profile` / `/settings` | Account settings — profile picture, account info, organization, change password |
| `/admin/users` | User management — table with status / role pills, dialogs |
| `/admin/prompts` | Agent system prompt editor — accordion per agent |
| anything else | 404 |

## Notes

- The original Claude Design bundle is a static HTML prototype with React via `<script>` tags. This project is the production-ready translation of that prototype: ES modules, TypeScript types, real router, real interactivity (theme toggle, multi-step signup, agent switching, dropdowns).
- Feedback feature was intentionally removed in the design — managed by another system per the design conversation.
- Theme tokens live in `src/styles/theme.css`. Light = `.tw-light`, dark = `.tw-dark`. Everything else uses `var(--*)`.
