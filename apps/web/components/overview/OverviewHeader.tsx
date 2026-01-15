"use client";

import { Button } from "@bullstudio/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bullstudio/ui/components/select";
import { RefreshCw, Database, Layers } from "lucide-react";
import dayjs from "@bullstudio/dayjs";

type Connection = {
  id: string;
  name: string;
};

type Queue = {
  name: string;
};

type OverviewHeaderProps = {
  connections: Connection[];
  loadingConnections: boolean;
  connectionId: string;
  onConnectionChange: (connectionId: string) => void;
  queues: Queue[];
  loadingQueues: boolean;
  queueName: string;
  onQueueChange: (queueName: string) => void;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
  onRefresh: () => void;
  lastUpdated?: number;
  isRefreshing?: boolean;
};

const TIME_RANGES = [
  { value: "1", label: "Last 1h" },
  { value: "6", label: "Last 6h" },
  { value: "24", label: "Last 24h" },
  { value: "72", label: "Last 3d" },
  { value: "168", label: "Last 7d" },
];

const ALL_QUEUES_VALUE = "__all__";

export function OverviewHeader({
  connections,
  loadingConnections,
  connectionId,
  onConnectionChange,
  queues,
  loadingQueues,
  queueName,
  onQueueChange,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  lastUpdated,
  isRefreshing,
}: OverviewHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={connectionId}
          onValueChange={onConnectionChange}
          disabled={loadingConnections}
        >
          <SelectTrigger className="w-[200px] bg-zinc-900/50 border-zinc-800">
            <Database className="size-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Select connection" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {connections.map((connection) => (
              <SelectItem
                key={connection.id}
                value={connection.id}
                className="text-zinc-100"
              >
                {connection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queueName || ALL_QUEUES_VALUE}
          onValueChange={(value) =>
            onQueueChange(value === ALL_QUEUES_VALUE ? "" : value)
          }
          disabled={!connectionId || loadingQueues}
        >
          <SelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800">
            <Layers className="size-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Select queue" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value={ALL_QUEUES_VALUE} className="text-zinc-100">
              All queues
            </SelectItem>
            {queues.map((queue) => (
              <SelectItem
                key={queue.name}
                value={queue.name}
                className="text-zinc-100 font-mono"
              >
                {queue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(timeRange)}
          onValueChange={(value) => onTimeRangeChange(Number(value))}
        >
          <SelectTrigger className="w-[130px] bg-zinc-900/50 border-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {TIME_RANGES.map((range) => (
              <SelectItem
                key={range.value}
                value={range.value}
                className="text-zinc-100"
              >
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-zinc-500">
            Updated {dayjs(lastUpdated).fromNow()}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh()}
          disabled={isRefreshing}
          className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
        >
          <RefreshCw
            className={`size-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
