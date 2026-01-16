// Email client
export { createEmailClient, defaultClient, type EmailClient } from "./client";

// Email templates
export {
  MagicLinkEmail,
  type MagicLinkEmailProps,
  WelcomeEmail,
  type WelcomeEmailProps,
  AlertTriggeredEmail,
  type AlertTriggeredEmailProps,
  AlertResolvedEmail,
  type AlertResolvedEmailProps,
  type AlertType,
} from "./templates";
