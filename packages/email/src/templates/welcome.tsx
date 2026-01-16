import { Button, Heading, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export type WelcomeEmailProps = {
  userName?: string;
  dashboardUrl?: string;
  docsUrl?: string;
};

export function WelcomeEmail({
  userName,
  dashboardUrl = "https://bullstudio.dev/dashboard",
  docsUrl = "https://docs.bullstudio.dev",
}: WelcomeEmailProps) {
  const greeting = userName ? `Hey ${userName}` : "Hey there";

  return (
    <EmailLayout preview="Welcome to bullstudio - queue monitoring made simple">
      <Heading style={styles.heading}>{greeting}, welcome aboard!</Heading>
      <Text style={styles.text}>
        You&apos;re all set to start monitoring your BullMQ queues. bullstudio
        gives you real-time insights into queue health, job states, throughput,
        and failures—all in one place.
      </Text>

      <Hr style={styles.divider} />

      <Heading as="h2" style={styles.subheading}>
        Getting started
      </Heading>
      <Text style={styles.listItem}>
        <strong>1. Connect your Redis</strong> — Add your first connection and
        we&apos;ll automatically discover your queues.
      </Text>
      <Text style={styles.listItem}>
        <strong>2. Set up alerts</strong> — Get notified when failure rates
        spike, backlogs grow, or workers go missing.
      </Text>
      <Text style={styles.listItem}>
        <strong>3. Explore your jobs</strong> — Inspect, retry, or delete jobs
        with a few clicks.
      </Text>

      <Button style={styles.button} href={dashboardUrl}>
        Open your dashboard
      </Button>

      <Text style={styles.subtext}>
        Need help getting started? Check out our{" "}
        <a href={docsUrl} style={styles.link}>
          documentation
        </a>{" "}
        or reply to this email—we&apos;re happy to help.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  heading: {
    color: "#18181b",
    fontSize: "24px",
    fontWeight: "600" as const,
    margin: "0 0 16px 0",
  },
  subheading: {
    color: "#18181b",
    fontSize: "18px",
    fontWeight: "600" as const,
    margin: "0 0 16px 0",
  },
  text: {
    color: "#3f3f46",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px 0",
  },
  listItem: {
    color: "#3f3f46",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 12px 0",
  },
  divider: {
    borderColor: "#e4e4e7",
    margin: "24px 0",
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: "6px",
    color: "#fafafa",
    display: "inline-block" as const,
    fontSize: "14px",
    fontWeight: "500" as const,
    marginTop: "8px",
    padding: "12px 24px",
    textDecoration: "none",
  },
  subtext: {
    color: "#71717a",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "24px 0 0 0",
  },
  link: {
    color: "#18181b",
    textDecoration: "underline",
  },
};

export default WelcomeEmail;
