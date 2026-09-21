import * as Sentry from "@sentry/nextjs";
import { sanitizeEvent } from "./lib/monitoring/sanitize-event";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: sanitizeEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
