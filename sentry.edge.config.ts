import * as Sentry from "@sentry/nextjs";

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    debug: false,
  });
}
