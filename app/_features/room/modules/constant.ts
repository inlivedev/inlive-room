export const iceServers = [
  {
    urls: 'turn:turn.inlive.app:3478',
    username: 'inlive',
    credential: 'inlivesdkturn',
  },
  {
    urls: 'stun:turn.inlive.app:3478',
  },
];

export const mediaConstraints = {
  video: true,
  audio: true,
};
