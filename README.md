# Translation Helper — UI

Production frontend for the Translation Helper feature inside the Shema OBT
platform. Talks to the `translation-helper` app inside `tripod-backend`.

Warm cream foundation grounded in the Shemá design system — telha terracotta
accent, Fraunces editorial serif, deep brown text, generous rounded surfaces.
Light and dark mode.

## Stack

- Vite + React 18 + TypeScript
- [`wouter`](https://github.com/molefrog/wouter) for routing
- [`zustand`](https://github.com/pmndrs/zustand) + React Context for state
- [`axios`](https://axios-http.com) (single client in `src/lib/api/`)
- [`lucide-react`](https://lucide.dev) for icons
- CSS variables (`src/styles/theme.css`) — no Tailwind, all styling inline against tokens

## Run — local (no docker)

Vite's dev server runs on host node and proxies `/api` to
`http://localhost:8000` automatically (see `vite.config.ts`). Pair it with the
tripod-backend running locally in docker.

```sh
npm install
npm run dev                              # Vite at http://localhost:5173
# In another shell, run the backend:
# cd ../tripod-backend && SECRETS_PROJECT_ID=... docker compose up --build backend
```

## Run — local (dockerized prod build)

Builds the production image, serves it via nginx on `:8080`, and reverse-proxies
`/api` to whatever backend the `gcp-secrets` sidecar resolves.

```sh
cp .env.example .env
# Default BACKEND_TARGET=local proxies /api to host.docker.internal:8000
docker compose up --build
open http://localhost:8080
```

To point the dockerized frontend at the production backend (URL fetched from GCP
Secret Manager `tripod_backend_cloud_run_url`):

```sh
gcloud auth application-default login    # one-time
BACKEND_TARGET=remote docker compose up --build
```

Override the host port: `PORT=3000 docker compose up`.

## CI/CD

- **`.github/workflows/lint.yml`** runs on every PR: ESLint + `tsc --noEmit`.
- **`.github/workflows/deploy.yml`** runs on push to `main`: builds the image,
  pushes to GCP Artifact Registry, deploys to Cloud Run service
  `translation-helper-ui` with the runtime `BACKEND_URL` injected from Secret
  Manager.

GitHub repo secrets required: `GCP_PROJECT_ID`, `GCP_SA_KEY`. The Secret
Manager secret `tripod_backend_cloud_run_url` must exist in the
`shemaobt-secrets` project and hold the tripod-backend Cloud Run URL (no
trailing slash). To create or rotate:

```sh
echo -n 'https://<tripod-backend>-<hash>-uc.a.run.app' | \
  gcloud secrets create tripod_backend_cloud_run_url \
  --data-file=- \
  --project=shemaobt-secrets \
  --replication-policy=automatic
# or, to rotate:
echo -n '<new url>' | gcloud secrets versions add tripod_backend_cloud_run_url --data-file=- --project=shemaobt-secrets
```

## Routes

| Route | Screen |
|---|---|
| `/` | Welcome — editorial hero, main input, inspiration cards |
| `/chat/:chatId?` | Chat — message thread, voice takeover, mic error states |
| `/login` | Sign in — handles `?status=pending\|rejected\|approved\|reset` |
| `/signup` | Two-step signup |
| `/forgot-password` | Request a reset link |
| `/reset-password` | Set new password (token in query) |
| `/profile` / `/settings` | Account settings |
| `/admin/prompts` | Agent system-prompt editor (platform admin only) |
| `*` | 404 |

## Notes

- All API calls go to relative `/api/*` URLs — the bundle is backend-URL
  agnostic. In dev, Vite proxies `/api` to localhost; in prod, nginx
  reverse-proxies it to the runtime-injected `$BACKEND_URL`.
- Theme tokens live in `src/styles/theme.css`. Light = `.tw-light`, dark = `.tw-dark`.
