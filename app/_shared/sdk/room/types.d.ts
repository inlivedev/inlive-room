export type Config = {
  api: {
    baseUrl: string;
    version: string;
  };
  webrtc: {
    iceServers: RTCIceServer[];
  };
};

export type UserConfig = {
  api?: {
    baseUrl?: string;
    version?: string;
  };
  webrtc?: {
    iceServers?: RTCIceServer[];
  };
};

export as namespace RoomType;
