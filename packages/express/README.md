# bullstudio-express

Express middleware adapter for the [bullstudio](https://www.npmjs.com/package/bullstudio) queue dashboard. Mount a full-featured Bull/BullMQ monitoring UI as middleware in your Express or NestJS app — no separate process needed.

## Installation

```bash
npm install bullstudio-express bullstudio
```

Both packages are required: `bullstudio` contains the dashboard UI and `bullstudio-express` provides the Express integration.

## Usage

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

app.listen(3000, () => {
  console.log("Dashboard available at http://localhost:3000/queues");
});
```

### NestJS

Mount in `main.ts`:

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

Or use the `MiddlewareConsumer` in a module:

```typescript
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createBullStudio } from "bullstudio-express";

@Module({})
export class DashboardModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer): void {
    const bullStudioRouter = createBullStudio({
      redisUrl: this.configService.get("REDIS_URL"),
      auth: {
        username: this.configService.get("BULLSTUDIO_USERNAME"),
        password: this.configService.get("BULLSTUDIO_PASSWORD"),
      },
    });

    consumer.apply(bullStudioRouter).forRoutes("/queues");
  }
}
```

### With Authentication

Protect the dashboard with HTTP Basic Auth:

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

## API

### `createBullStudio(options): Router`

Returns an Express `Router` that serves the bullstudio dashboard. Mount it at any path.

#### Options

| Option          | Type     | Required | Description                          |
| --------------- | -------- | -------- | ------------------------------------ |
| `redisUrl`      | `string` | Yes      | Redis connection URL                 |
| `auth.username` | `string` | No       | Username for HTTP Basic Auth         |
| `auth.password` | `string` | No       | Password for HTTP Basic Auth         |

## How It Works

The adapter serves the bullstudio dashboard through two layers:

1. **Static assets** — Client-side JS, CSS, and images are served with appropriate cache headers (hashed assets get immutable long-lived caching).
2. **SSR handler** — All other requests are delegated to TanStack Start's server-side rendering. HTML responses are rewritten to support mounting at any sub-path.

The base path is automatically detected from the Express mount point on the first request. Asset URLs and client-side routing are rewritten to match.

## Requirements

- Node.js >= 18
- Express >= 4.0
- `bullstudio` >= 1.1.0 (peer dependency)

## License

MIT
