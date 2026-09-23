# Incident Response Agent

Portfolio project: a **fake production API** (NestJS + PostgreSQL) that simulates company infra data, plus a **Python investigation agent** (planned). Right now you can run the API and seed incident stories into the database.

## Prerequisites

- Docker
- Node.js and npm

## Run locally

**1. PostgreSQL (repo root)**

```bash
cp .env.example .env
docker compose up -d
```

**2. API (`apps/api`)**

```bash
cd apps/api
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed -- --preset deployment-failure
npm run start:dev
```

API listens on `http://localhost:3000` by default.

## Service names

After seeding, these services exist. Use the **name** in URLs (no need to copy UUIDs):

| Name | Notes |
|------|--------|
| `checkout` | Main service in most incident presets |
| `payment` | Relevant for payment-provider-degradation |
| `orders` | Background services |
| `catalog` | Background services |

Paths like `/services/:serviceId/...` accept **name or UUID**. Query param `serviceId` on logs/incidents works the same way.

## Try it

With the API running and `deployment-failure` seeded:

```bash
curl http://localhost:3000/services
curl http://localhost:3000/services/checkout/health
curl "http://localhost:3000/services/checkout/metrics?metric=error_rate"
curl http://localhost:3000/services/checkout/deployments
curl "http://localhost:3000/logs?serviceId=checkout&query=PaymentProviderTimeout"
curl http://localhost:3000/databases/production-db/metrics
curl http://localhost:3000/incidents
```

Expected: checkout **health** is `degraded` with elevated `errorRate`. The log `query` value comes from the seeded preset (substring match on log `message`); see [Searching logs](apps/api/README.md#searching-logs) in the API README.

**Another preset:**

```bash
cd apps/api
npm run db:seed -- --preset healthy
curl http://localhost:3000/services/checkout/health
```

Expected: checkout **health** is `healthy`.

## More detail

See [apps/api/README.md](apps/api/README.md) for seed presets, npm scripts, and troubleshooting.
