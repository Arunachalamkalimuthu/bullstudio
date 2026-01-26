import * as React from "react";
import { Button, Heading, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export type AlertType =
  | "FailureRate"
  | "BacklogExceeded"
  | "ProcessingTimeAvg"
  | "ProcessingTimeP95"
  | "ProcessingTimeP99"
  | "MissingWorkers";

export type AlertResolvedEmailProps = {
  alertName: string;
  alertType: AlertType;
  queueName: string;
  connectionName: string;
  currentValue: string;
  previousValue: string;
  resolvedAt: Date;
  triggeredAt: Date;
  dashboardUrl?: string;
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  FailureRate: "Failure Rate",
  BacklogExceeded: "Backlog Exceeded",
  ProcessingTimeAvg: "Avg Processing Time",
  ProcessingTimeP95: "P95 Processing Time",
  ProcessingTimeP99: "P99 Processing Time",
  MissingWorkers: "Missing Workers",
};

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function AlertResolvedEmail({
  alertName,
  alertType,
  queueName,
  connectionName,
  currentValue,
  previousValue,
  resolvedAt,
  triggeredAt,
  dashboardUrl,
}: AlertResolvedEmailProps) {
  const duration = formatDuration(triggeredAt, resolvedAt);
  const formattedTime = resolvedAt.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <EmailLayout preview={`Alert resolved: ${alertName}`}>
      <div style={styles.statusBanner}>
        <Text style={styles.statusLabel}>RESOLVED</Text>
        <Heading style={styles.alertName}>{alertName}</Heading>
      </div>

      <Text style={styles.message}>
        Good news—the alert condition has been resolved. The{" "}
        {ALERT_TYPE_LABELS[alertType].toLowerCase()} for{" "}
        <strong>{queueName}</strong> is back within normal thresholds.
      </Text>

      <Hr style={styles.divider} />

      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.labelCell}>Alert Type</td>
            <td style={styles.valueCell}>{ALERT_TYPE_LABELS[alertType]}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Queue</td>
            <td style={styles.valueCell}>
              <code style={styles.code}>{queueName}</code>
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Connection</td>
            <td style={styles.valueCell}>{connectionName}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Previous Value</td>
            <td style={styles.valueCell}>
              <span style={styles.previousValue}>{previousValue}</span>
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Current Value</td>
            <td style={styles.valueCell}>
              <strong style={styles.currentValue}>{currentValue}</strong>
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Duration</td>
            <td style={styles.valueCell}>{duration}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Resolved At</td>
            <td style={styles.valueCell}>{formattedTime}</td>
          </tr>
        </tbody>
      </table>

      {dashboardUrl && (
        <Button style={styles.button} href={dashboardUrl}>
          View in Dashboard
        </Button>
      )}

      <Text style={styles.subtext}>
        The alert was active for {duration}. You can review the incident
        timeline in your dashboard.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  statusBanner: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    marginBottom: "24px",
    padding: "16px",
  },
  statusLabel: {
    backgroundColor: "#16a34a",
    borderRadius: "4px",
    color: "#ffffff",
    display: "inline-block" as const,
    fontSize: "11px",
    fontWeight: "600" as const,
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
    padding: "4px 8px",
  },
  alertName: {
    color: "#166534",
    fontSize: "20px",
    fontWeight: "600" as const,
    margin: 0,
  },
  message: {
    color: "#3f3f46",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 24px 0",
  },
  divider: {
    borderColor: "#e4e4e7",
    margin: "0 0 24px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "24px",
  },
  labelCell: {
    color: "#71717a",
    fontSize: "14px",
    padding: "10px 0",
    borderBottom: "1px solid #f4f4f5",
    verticalAlign: "top" as const,
  },
  valueCell: {
    color: "#18181b",
    fontSize: "14px",
    fontWeight: "500" as const,
    padding: "10px 0",
    borderBottom: "1px solid #f4f4f5",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  previousValue: {
    color: "#71717a",
    textDecoration: "line-through",
  },
  currentValue: {
    color: "#16a34a",
  },
  code: {
    backgroundColor: "#f4f4f5",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "13px",
    padding: "2px 6px",
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: "6px",
    color: "#fafafa",
    display: "inline-block" as const,
    fontSize: "14px",
    fontWeight: "500" as const,
    padding: "12px 24px",
    textDecoration: "none",
  },
  subtext: {
    color: "#71717a",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "24px 0 0 0",
  },
};

export default AlertResolvedEmail;
