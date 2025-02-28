import { Room } from '@inlivedev/inlive-js-sdk';
export { RoomEvent, ChannelClosureReasons } from '@inlivedev/inlive-js-sdk';

const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN;
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION;

export const clientSDK = Room({
  api: {
    baseUrl: inliveHubOrigin,
    version: inliveHubVersion,
  },
  media: {
    screen: {
      svc: false,
      videoCodecs: ['video/VP9', 'video/VP8', 'video/H264'],
    },
  },
});
