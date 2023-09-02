export const api = {
  baseUrl: 'https://hub.inlive.app',
  version: 'v1',
};

export const webrtc = {
  iceServers: [
    {
      urls: 'turn:turn.inlive.app:3478',
      username: 'inlive',
      credential: 'inlivesdkturn',
    },
    {
      urls: 'stun:turn.inlive.app:3478',
    },
  ],
};
