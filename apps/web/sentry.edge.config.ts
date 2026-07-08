import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? "https://b8b3f4625f998ba4f6d7eb5766ea9c73@o4511699885817856.ingest.de.sentry.io/4511699892568144",

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  enableLogs: true,
});
