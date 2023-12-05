import { Room } from '@inlivedev/inlive-js-sdk/dist/room';

const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN;
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION;
const inliveHubApiKey = process.env.INLIVE_HUB_API_KEY;

export const serverSDK = Room({
  api: {
    baseUrl: inliveHubOrigin,
    version: inliveHubVersion,
    apiKey: inliveHubApiKey,
  },
});
