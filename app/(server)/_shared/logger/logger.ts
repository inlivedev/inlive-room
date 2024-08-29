import * as Sentry from '@sentry/nextjs';

export class DefaultLogger {
  async captureException(e: any) {
    console.log(e);
    Sentry.captureException(e);
  }
}

export const defaultLogger = new DefaultLogger();
