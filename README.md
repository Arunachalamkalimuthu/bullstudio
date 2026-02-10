<p align="center">
  <img src="assets/logo.svg" alt="bullstudio" width="120" />
</p>

<h1 align="center">bullstudio</h1>

<p align="center">
  A lightweight, beautiful queue management dashboard for <a href="https://github.com/OptimalBits/bull">Bull</a> and <a href="https://docs.bullmq.io/">BullMQ</a>.<br/>
  Monitor your queues, inspect jobs, visualize flows, and manage your Redis-backed job infrastructure.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/BullMQ-5.x-orange" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Bull-4.x-orange" alt="Bull" />
  <img src="https://img.shields.io/badge/React-19-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript" />
</p>

---

<div align="center">
<img width="80%" src="https://github.com/user-attachments/assets/b5eea348-5919-40ff-ad55-3a0387dbec47" />
</div>

## Quick Start

### Embed in your backend (recommended)

```bash
npm install bullstudio-express bullstudio
```

```typescript
import express from "express";
import { createBullStudio } from "bullstudio-express";

const app = express();

app.use(
  "/queues",
  createBullStudio({
    redisUrl: "redis://localhost:6379",
  })
);

app.listen(3000, () => {
  console.log("Dashboard available at http://localhost:3000/queues");
});
```

Navigate to `/queues` and the full dashboard renders with your Redis configuration. bullstudio automatically detects your queue provider (Bull or BullMQ).

### Run standalone

```bash
npx bullstudio -r <redis_url>
```

Opens automatically at [http://localhost:4000](http://localhost:4000).

---

## Express Adapter

Mount bullstudio as middleware in your Express or NestJS app. The dashboard renders at your chosen path with full SSR — no separate process needed.

### Installation

```bash
npm install bullstudio-express bullstudio
```

### Express

```typescript
import express from "express";
import { createBullStudio } from "bullstudio-express";

const app = express();

app.use(
  "/queues",
  createBullStudio({
    redisUrl: "redis://localhost:6379",
  })
);

app.listen(3000);
```

### NestJS

```typescript
import { NestFactory } from "@nestjs/core";
import { createBullStudio } from "bullstudio-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    "/queues",
    createBullStudio({
      redisUrl: "redis://localhost:6379",
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### With Authentication

```typescript
app.use(
  "/queues",
  createBullStudio({
    redisUrl: "redis://localhost:6379",
    auth: {
      username: "admin",
      password: "secret123",
    },
  })
);
```

### Options

| Option          | Type     | Description                  | Required |
| --------------- | -------- | ---------------------------- | -------- |
| `redisUrl`      | `string` | Redis connection URL         | Yes      |
| `auth.username` | `string` | Username for HTTP Basic Auth | No       |
| `auth.password` | `string` | Password for HTTP Basic Auth | No       |

Supports mounting at any sub-path. Asset URLs and routing are automatically rewritten to match the mount point.

---

## CLI

```bash
bullstudio [options]
```

| Option              | Short | Description                    | Default                  |
| ------------------- | ----- | ------------------------------ | ------------------------ |
| `--redis <url>`     | `-r`  | Redis connection URL           | `redis://localhost:6379` |
| `--port <port>`     | `-p`  | Port to run the dashboard on   | `4000`                   |
| `--username <user>` |       | Username for HTTP Basic Auth   | `bullstudio`             |
| `--password <pass>` |       | Password for HTTP Basic Auth   | (none)                   |
| `--no-open`         |       | Don't open browser             | Opens browser            |
| `--help`            | `-h`  | Show help                      |                          |

```bash
# Remote Redis
bullstudio -r redis://myhost.com:6379

# Redis with auth
bullstudio -r redis://username:password@myhost.com:6379

# Custom port, no browser
bullstudio -r redis://:secret@production.redis.io:6379 -p 8080 --no-open

# Protect dashboard
bullstudio --password secret123
```

---

## Features

### Overview Dashboard
Real-time queue health metrics, throughput charts, processing time analytics, failure tracking, slowest jobs, and failing job types.

### Jobs Browser
- Browse all jobs across queues
- Filter by status: waiting, active, completed, failed, delayed, paused, waiting-children
- Search jobs by name, ID, or data
- Retry or delete jobs
- View job data, return values, and stack traces

### Flows Visualization
- Interactive graph of parent-child job relationships
- Live job state tracking per node
- Click-through to job details
- Auto-refresh while flows are active

### Queue Management
- List and inspect all discovered queues
- Pause and resume queues
- Per-queue statistics and health

### Auto-Detection
Automatically scans Redis for BullMQ and Bull metadata keys and detects the correct provider.

---

## Authentication

HTTP Basic Auth for the standalone CLI (production mode only).

```bash
# CLI flag
bullstudio --password secret123

# Custom username
bullstudio --username admin --password secret123

# Environment variable
BULLSTUDIO_PASSWORD=secret123 bullstudio
```

For the Express adapter, pass `auth` in the options (see above).

The `/health` endpoint is always publicly accessible:

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"...","redis":"configured"}
```

---

## Environment Variables

| Variable              | Description                  | Default                  |
| --------------------- | ---------------------------- | ------------------------ |
| `REDIS_URL`           | Redis connection URL         | `redis://localhost:6379` |
| `PORT`                | Dashboard port               | `4000`                   |
| `BULLSTUDIO_USERNAME` | HTTP Basic Auth username     | `bullstudio`             |
| `BULLSTUDIO_PASSWORD` | HTTP Basic Auth password     | (none)                   |

CLI flags take precedence over environment variables.

---

## Requirements

- **Node.js** 18+
- **Redis** server (local or remote)
- **Bull** or **BullMQ** queues in your Redis instance

---

## Troubleshooting

### "Connection refused" error

Make sure Redis is running:

```bash
redis-cli ping

# macOS
brew services start redis

# Docker
docker run -d -p 6379:6379 redis
```

### No queues showing up

1. Your application has created at least one queue
2. You're connecting to the correct Redis instance
3. Your queues use the default `bull` prefix

### Port already in use

```bash
bullstudio -p 5000
```

---

## License

MIT

---

<p align="center">
  Made with love for the BullMQ community
</p>
