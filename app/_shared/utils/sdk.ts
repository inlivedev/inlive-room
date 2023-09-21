import { Room } from '@/_shared/sdk/room';

const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN;
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION;

export const room = Room({
  api: {
    baseUrl: inliveHubOrigin,
    version: inliveHubVersion,
  },
});
