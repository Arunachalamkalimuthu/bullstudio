import { Prisma, PrismaClient } from "@bullstudio/prisma";

type TGetBacklogTimeseries = {
  prisma: PrismaClient;
  queueId: string;
  from: Date;
  to: Date;
};

type BacklogTimeseriesPoint = {
  ts: string;
  backlog: number;
};

/**
 * Returns a timeseries of the queue backlog for a given queue id within a specified date range.
 * The backlog at each hour is the count of jobs that were ready (queued + delay elapsed)
 * but had not yet started processing by the end of that hour.
 */
export async function getBacklogTimeseries({
  prisma,
  queueId,
  from,
  to,
}: TGetBacklogTimeseries): Promise<BacklogTimeseriesPoint[]> {
  const rows = await prisma.$queryRaw<
    Array<{ ts: Date; backlog: bigint }>
  >(Prisma.sql`
    WITH hours AS (
      SELECT generate_series(
        date_trunc('hour', ${from}::timestamp),
        date_trunc('hour', ${to}::timestamp),
        '1 hour'::interval
      ) AS hour_end
    )
    SELECT
      h.hour_end AS "ts",
      COUNT(j.id)::bigint AS "backlog"
    FROM hours h
    LEFT JOIN "Job" j ON
      j."queueId" = ${queueId}
      AND (j."queuedAt" + (COALESCE(j."delay", 0) * INTERVAL '1 millisecond')) <= h.hour_end
      AND (j."startedAt" IS NULL OR j."startedAt" > h.hour_end)
    GROUP BY h.hour_end
    ORDER BY h.hour_end ASC
  `);

  return rows.map((row) => ({
    ts: row.ts.toDateString(),
    backlog: Number(row.backlog),
  }));
}
