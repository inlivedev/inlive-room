const features = {
  event: process.env.NEXT_PUBLIC_ENABLE_WEBINAR === 'true',
};

const whitelistFeature = Object.entries(features)
  .filter(([, enabled]) => !!enabled)
  .map(([feature]) => feature);

export { whitelistFeature };
