import * as React from "react";
import { Resend } from "resend";

type SendEmailOptions<P> = {
  to: string | string[];
  subject: string;
  template: (props: P) => React.JSX.Element;
  props: P;
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  scheduledAt?: string;
};

type EmailClientConfig = {
  apiKey: string;
  defaultFrom: string;
};

type SendEmailResult =
  | { success: true; id: string }
  | { success: false; error: string };

/**
 * Creates a type-safe email client powered by Resend.
 *
 * @example
 * ```ts
 * import { createEmailClient } from "@bullstudio/email/client";
 * import { WelcomeEmail } from "@bullstudio/email/templates/welcome";
 *
 * const email = createEmailClient({
 *   apiKey: process.env.RESEND_API_KEY!,
 *   defaultFrom: "bullstudio <noreply@bullstudio.dev>",
 * });
 *
 * // Props are automatically inferred from the template
 * await email.send({
 *   to: "user@example.com",
 *   subject: "Welcome to bullstudio",
 *   template: WelcomeEmail,
 *   props: { userName: "John" }, // TypeScript knows the exact shape
 * });
 * ```
 */
export function createEmailClient(config: EmailClientConfig) {
  const resend = new Resend(config.apiKey);

  return {
    /**
     * Send an email using a React Email template.
     * Props are automatically inferred from the template component.
     */
    async send<P>(options: SendEmailOptions<P>): Promise<SendEmailResult> {
      const {
        to,
        subject,
        template: Template,
        props,
        from,
        replyTo,
        cc,
        bcc,
        scheduledAt,
      } = options;

      try {
        const { data, error } = await resend.emails.send({
          from: from ?? config.defaultFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          react: Template(props),
          replyTo,
          cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
          bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
          scheduledAt,
        });

        console.log("Email send response:", { data, error });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, id: data?.id ?? "" };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send email";
        console.error("Error sending email:", message);
        return { success: false, error: message };
      }
    },

    /**
     * Send a batch of emails. Useful for sending to multiple recipients
     * with different props.
     */
    async sendBatch<P>(
      emails: Array<SendEmailOptions<P>>,
    ): Promise<SendEmailResult[]> {
      return Promise.all(emails.map((email) => this.send(email)));
    },
  };
}

export const defaultClient = createEmailClient({
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: "bullstudio <emir@mail.bullstudio.dev>",
});

export type EmailClient = ReturnType<typeof createEmailClient>;
