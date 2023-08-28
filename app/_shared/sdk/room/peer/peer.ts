import { iceServers } from '../config/webrtc';

export const Peer = ({ roomId, clientId, api }: RoomPeerTypes.PeerProps) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: iceServers,
  });

  peerConnection.addEventListener('iceconnectionstatechange', () => {
    if (!peerConnection) return;

    console.log(
      'ice connection state changed to',
      peerConnection.iceConnectionState
    );
  });

  peerConnection.addEventListener('negotiationneeded', async () => {
    const allowNegotiateResponse = await api.checkNegotiateAllowed(
      roomId,
      clientId
    );

    if (allowNegotiateResponse.ok) {
      if (!peerConnection) return;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (peerConnection.localDescription) {
        const negotiateResponse = await api.negotiateConnection(
          roomId,
          clientId,
          peerConnection.localDescription
        );

        const { answer } = negotiateResponse.data;
        const sdpAnswer = new RTCSessionDescription(answer);
        await peerConnection.setRemoteDescription(sdpAnswer);
      }
    }
  });

  peerConnection.addEventListener(
    'icecandidate',
    async (event: RTCPeerConnectionIceEvent) => {
      const { candidate } = event;

      if (candidate) {
        await api.sendIceCandidate(roomId, clientId, candidate);
      }
    }
  );

  return {
    getPeerConnection() {
      return peerConnection;
    },

    addTrack(stream: MediaStream) {
      if (!peerConnection) return;

      if (stream instanceof MediaStream) {
        for (const track of stream.getTracks()) {
          peerConnection.addTrack(track, stream);
        }
      }
    },
  };
};
