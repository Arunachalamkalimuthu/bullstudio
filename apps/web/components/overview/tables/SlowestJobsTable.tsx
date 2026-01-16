"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@bullstudio/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@bullstudio/ui/components/table";
import { useWorkspaceContext } from "@/components/providers/WorkspaceProvider";
import type { RouterOutput } from "@/lib/trpc";
import { useNavigateToJob } from "@/components/jobs/useNavigateToJob";

type SlowJob = RouterOutput["queue"]["overviewMetrics"]["slowestJobs"][number];

type SlowestJobsTableProps = {
  jobs: SlowJob[];
  connectionId: string;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export function SlowestJobsTable({
  jobs,
  connectionId,
}: SlowestJobsTableProps) {
  const gotoJob = useNavigateToJob();

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Slowest Jobs</CardTitle>
        <CardDescription className="text-zinc-500">
          Top 10 jobs by processing time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No completed jobs in this time range
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Job</TableHead>
                <TableHead className="text-zinc-400">Queue</TableHead>
                <TableHead className="text-zinc-400 text-right">
                  Duration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="border-zinc-800 cursor-pointer hover:bg-zinc-800/50"
                  onClick={() => gotoJob(job.id, connectionId, job.queueName)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-100">
                        {job.name}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {job.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-zinc-400">
                      {job.queueName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm text-amber-500">
                      {formatDuration(job.processingTimeMs)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
