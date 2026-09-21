import * as Sentry from "@sentry/nextjs";
import { sanitizeEvent } from "./lib/monitoring/sanitize-event";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? "development",
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: sanitizeEvent,
});
