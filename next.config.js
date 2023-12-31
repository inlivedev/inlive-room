const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
  },
  {
    hideSourceMaps: true,
    disableLogger: true,
    widenClientFileUpload: true,
  }
);
