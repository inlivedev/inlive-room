import { Room } from '@/_shared/sdk/room';
const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN || '';
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || '';

export const room = Room({
  api: {
    baseUrl: hubOrigin,
    version: apiVersion,
  },
});
