import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>bullstudio</Text>
          </Section>
          <Section style={styles.content}>{children}</Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is an automated message from bullstudio.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden" as const,
  },
  header: {
    backgroundColor: "#18181b",
    padding: "24px 32px",
  },
  logo: {
    color: "#fafafa",
    fontSize: "20px",
    fontWeight: "600" as const,
    margin: 0,
  },
  content: {
    padding: "32px",
  },
  footer: {
    borderTop: "1px solid #e4e4e7",
    padding: "24px 32px",
  },
  footerText: {
    color: "#71717a",
    fontSize: "12px",
    margin: 0,
    textAlign: "center" as const,
  },
};
