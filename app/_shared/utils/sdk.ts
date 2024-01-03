import { Room } from '@inlivedev/inlive-js-sdk/dist/room';
export {
  RoomEvent,
  ChannelClosureReasons,
} from '@inlivedev/inlive-js-sdk/dist/room';

const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN;
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION;

export const clientSDK = Room({
  api: {
    baseUrl: inliveHubOrigin,
    version: inliveHubVersion,
  },
});
