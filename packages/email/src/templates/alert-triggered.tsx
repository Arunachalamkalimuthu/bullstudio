import * as React from "react";
import {
  Button,
  Heading,
  Hr,
  Row,
  Column,
  Text,
} from "@react-email/components";
import { EmailLayout } from "./components/layout";

export type AlertType =
  | "FailureRate"
  | "BacklogExceeded"
  | "ProcessingTimeAvg"
  | "ProcessingTimeP95"
  | "ProcessingTimeP99"
  | "MissingWorkers";

export type AlertTriggeredEmailProps = {
  alertName: string;
  alertType: AlertType;
  queueName: string;
  connectionName: string;
  currentValue: string;
  threshold: string;
  message: string;
  timestamp: Date;
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

export function AlertTriggeredEmail({
  alertName,
  alertType,
  queueName,
  connectionName,
  currentValue,
  threshold,
  message,
  timestamp,
  dashboardUrl,
}: AlertTriggeredEmailProps) {
  const formattedTime = timestamp.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <EmailLayout preview={`Alert triggered: ${alertName}`}>
      <div style={styles.statusBanner}>
        <Text style={styles.statusLabel}>TRIGGERED</Text>
        <Heading style={styles.alertName}>{alertName}</Heading>
      </div>

      <Text style={styles.message}>{message}</Text>

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
            <td style={styles.labelCell}>Current Value</td>
            <td style={styles.valueCell}>
              <strong style={styles.valueHighlight}>{currentValue}</strong>
            </td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Threshold</td>
            <td style={styles.valueCell}>{threshold}</td>
          </tr>
          <tr>
            <td style={styles.labelCell}>Triggered At</td>
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
        You&apos;re receiving this because you&apos;re subscribed to alerts for
        the <strong>{queueName}</strong> queue.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  statusBanner: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    marginBottom: "24px",
    padding: "16px",
  },
  statusLabel: {
    backgroundColor: "#dc2626",
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
    color: "#991b1b",
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
  valueHighlight: {
    color: "#dc2626",
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

export default AlertTriggeredEmail;
