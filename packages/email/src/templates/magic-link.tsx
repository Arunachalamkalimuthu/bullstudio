import * as React from "react";
import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout";

export type MagicLinkEmailProps = {
  magicLink: string;
  expiresInMinutes?: number;
};

export function MagicLinkEmail({
  magicLink,
  expiresInMinutes = 15,
}: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your sign-in link for bullstudio">
      <Heading style={styles.heading}>Sign in to bullstudio</Heading>
      <Text style={styles.text}>
        Click the button below to securely sign in to your account. No password
        required.
      </Text>
      <Button style={styles.button} href={magicLink}>
        Sign in to bullstudio
      </Button>
      <Text style={styles.subtext}>
        This link expires in {expiresInMinutes} minutes. If you didn&apos;t
        request this email, you can safely ignore it.
      </Text>
      <Text style={styles.linkFallback}>
        Or copy and paste this URL into your browser:
      </Text>
      <Text style={styles.link}>{magicLink}</Text>
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
  text: {
    color: "#3f3f46",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 24px 0",
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
    fontSize: "14px",
    lineHeight: "20px",
    margin: "24px 0 0 0",
  },
  linkFallback: {
    color: "#71717a",
    fontSize: "12px",
    margin: "24px 0 8px 0",
  },
  link: {
    color: "#18181b",
    fontSize: "12px",
    fontFamily: "monospace",
    margin: 0,
    wordBreak: "break-all" as const,
  },
};

export default MagicLinkEmail;
