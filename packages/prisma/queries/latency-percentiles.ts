import { Prisma, PrismaClient } from "@bullstudio/prisma";

type TComputeLatencyPercentiles = {
  prisma: PrismaClient;
  queueId: string;
  from: Date;
  to?: Date;
};

export async function computeLatencyPercentiles({
  prisma,
  queueId,
  from,
  to,
}: TComputeLatencyPercentiles) {
  const percentiles = await prisma.$queryRaw<
    Array<{
      wait_p50_ms: number | null;
      wait_p95_ms: number | null;
      proc_p50_ms: number | null;
      proc_p95_ms: number | null;
    }>
  >(Prisma.sql`
  SELECT
    percentile_cont(0.5) WITHIN GROUP (
      ORDER BY (
        EXTRACT(
          EPOCH FROM (
            "startedAt" - ("queuedAt" + (COALESCE("delay", 0) * INTERVAL '1 millisecond'))
          )
        ) * 1000
      )
    ) FILTER (WHERE "startedAt" IS NOT NULL)::float8 AS "wait_p50_ms",
    percentile_cont(0.95) WITHIN GROUP (
      ORDER BY (
        EXTRACT(
          EPOCH FROM (
            "startedAt" - ("queuedAt" + (COALESCE("delay", 0) * INTERVAL '1 millisecond'))
          )
        ) * 1000
      )
    ) FILTER (WHERE "startedAt" IS NOT NULL)::float8 AS "wait_p95_ms",
    percentile_cont(0.5) WITHIN GROUP (
      ORDER BY (EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) * 1000)
    ) FILTER (WHERE "finishedAt" IS NOT NULL AND "startedAt" IS NOT NULL)::float8 AS "proc_p50_ms",
    percentile_cont(0.95) WITHIN GROUP (
      ORDER BY (EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) * 1000)
    ) FILTER (WHERE "finishedAt" IS NOT NULL AND "startedAt" IS NOT NULL)::float8 AS "proc_p95_ms"
  FROM "Job"
  WHERE
    "queueId" = ${queueId}
    AND "queuedAt" >= ${from}
    AND (("startedAt" IS NOT NULL) OR ("finishedAt" IS NOT NULL))
    AND "queuedAt" <= ${to ?? new Date()}
`);

  return (
    percentiles[0] ?? {
      wait_p50_ms: null,
      wait_p95_ms: null,
      proc_p50_ms: null,
      proc_p95_ms: null,
    }
  );
}
