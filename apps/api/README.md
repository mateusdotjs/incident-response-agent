# Incident Response Agent — API

NestJS REST API backed by PostgreSQL. Incident stories are loaded with **`db:seed`**; the API only reads the database.

## Quick start

From the **repo root**: `cp .env.example .env` and `docker compose up -d`.

Then in **`apps/api`**:

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed -- --preset deployment-failure
npm run start:dev
```

Base URL: `http://localhost:3000` (see `PORT` in `.env`).

## Service names

Every seed creates the same four services. Use these names in paths and in `?serviceId=`:

| Name | Typical use |
|------|-------------|
| `checkout` | Primary service under investigation |
| `payment` | Payment provider scenarios |
| `orders` | Supporting data |
| `catalog` | Supporting data |

Example: `GET /services/checkout/health` — not the UUID from `GET /services`.

UUIDs still work if you pass the `id` field from JSON responses (e.g. for a future agent).

## Seed presets

Each run **wipes and reloads** all data.

| Preset | Checkout health (typical) | Example log `query=` (substring on `message`) |
|--------|---------------------------|--------------------------------------------------|
| `deployment-failure` | `degraded` — deploy 2.4.1 | `PaymentProviderTimeout` |
| `payment-provider-degradation` | `degraded` — check `payment` health too | `PaymentProviderError` |
| `database-overload` | `degraded` — high DB metrics | `DatabaseQueryTimeout` |
| `healthy` | `healthy` | (mostly INFO; try `Order placed`) |

```bash
npm run db:seed -- --preset healthy
```

## Searching logs

`GET /logs` accepts optional `query`. It is a **case-insensitive substring search** on the log **`message`** field (not full-text search over metadata).

You are not expected to guess strings out of nowhere:

1. **Match the preset you seeded** — the table above lists messages inserted by each preset (defined in `src/seed/presets/`).
2. **Browse first** — omit `query` to see what is in the DB, then filter:

```bash
curl "http://localhost:3000/logs?serviceId=checkout&limit=20"
curl "http://localhost:3000/logs?serviceId=checkout&level=ERROR&limit=20"
```

After `deployment-failure`, filtering with `query=PaymentProviderTimeout` works because the seed writes ERROR logs with that exact message on checkout.

## Example requests

```bash
curl http://localhost:3000/services
curl http://localhost:3000/services/checkout/health
curl "http://localhost:3000/services/checkout/metrics?metric=error_rate"
curl http://localhost:3000/services/checkout/deployments
curl "http://localhost:3000/logs?serviceId=checkout&query=PaymentProviderTimeout&limit=10"
curl http://localhost:3000/databases/production-db/metrics
curl http://localhost:3000/incidents
curl http://localhost:3000/services/payment/health
```

Deployment details (UUID from list response — copy `items[0].id` once if needed):

```bash
curl http://localhost:3000/services/checkout/deployments
curl http://localhost:3000/deployments/<deployment-uuid>
```

`from` / `to` on metrics and deployments are optional; omit them to return all seeded points.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | API with watch |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed -- --preset <name>` | Reset DB and load preset |
| `npm run db:generate` | Generate migration after schema change |

## Troubleshooting

- **Tables missing** — Run `db:migrate` before `db:seed`.
- **Connection refused** — `docker compose up -d` from repo root; check `DATABASE_URL`.
- **404 on service name** — Run seed first; names are fixed (`checkout`, etc.).
