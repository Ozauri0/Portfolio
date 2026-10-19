This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
bun install
bun run dev
```

Este proyecto usa **bun** como gestor de paquetes (`bun.lock`). No uses npm/yarn/pnpm.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Dependency review

Run `bun audit --prod` in the repository root and in `api/` before every release (both must report no vulnerabilities).
Dependabot (`.github/dependabot.yml`) opens weekly update PRs for both packages and monthly ones for the Docker base images.
`react-icons` is pinned to `5.5.0` because newer versions removed icons used in `src/lib/techIcons.tsx`; `overrides` in `package.json` force patched `postcss` and `sharp` versions required by `next`.

## Client IP / reverse proxy

Rate limits and login logs use the client IP taken from the entries that *our* proxies append to `X-Forwarded-For` (never the first, client-controlled one).
Set `TRUSTED_PROXY_HOPS` (in **both** `.env` and `api/.env`) to the number of trusted proxies in front of the app (default `1` = nginx; use `2` for Cloudflare + nginx, with nginx using `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`).
To verify: log in to the admin panel and check that "Últimas Conexiones" shows your public IP (not a Cloudflare or private one).
The `/api/*` proxy rewrites `X-Forwarded-For` and drops `X-Real-IP` before forwarding to the API.

## Docker deployment

Both images are based on `oven/bun:1-alpine` (install, build and runtime all use bun) and run as a non-root user.

1. Create the external network used by `docker-compose.yml` once: `docker network create red-internet`.
2. Create `.env` (frontend, see `.env.example`) and `api/.env` (API, see `api/.env.example`).
3. Build and start: `docker compose build --no-cache && docker compose up -d`.
4. Check `docker compose ps` (API healthcheck uses `/api/health`).

On the server prefer `./scripts/deploy.sh`: it refuses to run with local changes (a blocked `git pull` would silently rebuild old code), pulls, rebuilds without cache, brings the stack up, waits for the API healthcheck and **reloads Nginx Proxy Manager** (recreating containers changes their IPs and nginx caches them, which causes Cloudflare 502/52x errors).
