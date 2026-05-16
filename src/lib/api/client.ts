import axios, { AxiosError, type AxiosInstance } from 'axios';

// All API calls go to relative `/api/*` URLs. In production they hit the
// same origin (an nginx that reverse-proxies `/api` to the backend, see
// nginx.conf + docker-entrypoint.sh + docker-compose.yml). For local
// `npm run dev`, Vite's dev server proxies `/api` to http://localhost:8000
// (see vite.config.ts). This keeps the bundle backend-URL-agnostic.

export const api: AxiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

let getAccessToken: () => string | null = () => null;
let onUnauthorized: () => void = () => undefined;

export function configureApiAuth(opts: {
  getAccessToken: () => string | null;
  onUnauthorized?: () => void;
}): void {
  getAccessToken = opts.getAccessToken;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Returns the absolute origin for non-axios calls (e.g. SSE via fetch).
 *  Empty string means "same origin as the page", which is what we want
 *  both in dev (Vite proxy) and in prod (nginx reverse proxy). */
export function apiBaseUrl(): string {
  return '';
}
