import { Room, createAuth } from '@inlivedev/inlive-js-sdk';
const inliveHubApiKey = process.env.INLIVE_HUB_API_KEY;
const inliveApiOrigin = process.env.NEXT_PUBLIC_INLIVE_API_ORIGIN;
const inliveApiVersion = process.env.NEXT_PUBLIC_INLIVE_API_VERSION;
const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN;
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION;

const createSDKAuth = async () => {
  if (typeof window !== 'undefined') return null;

  return createAuth({
    apiVersion: inliveApiVersion,
    baseUrl: inliveApiOrigin,
    apiKey: inliveHubApiKey,
    expirySeconds: 3600,
  });
};

const serverSDK = Room({
  api: {
    baseUrl: inliveHubOrigin,
    version: inliveHubVersion,
  },
});

const sdkAuth = await createSDKAuth();

if (sdkAuth) {
  serverSDK.setAuth(sdkAuth);
}

export { serverSDK };
