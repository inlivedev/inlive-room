export const Channel = ({
  roomId,
  clientId,
  hubBaseURL,
  api,
  peer,
}: RoomChannelTypes.ChannelProps) => {
  const channel = new EventSource(
    `${hubBaseURL}/rooms/${roomId}/events/${clientId} `
  );

  channel.addEventListener('candidate', async (event: MessageEvent<any>) => {
    const peerConnection = peer.getPeerConnection();

    if (!peerConnection || !peerConnection.remoteDescription) {
      return;
    }

    const candidate = new RTCIceCandidate(JSON.parse(event.data));
    await peerConnection.addIceCandidate(candidate);
  });

  channel.addEventListener('offer', async (event: MessageEvent<any>) => {
    const peerConnection = peer.getPeerConnection();

    if (!peerConnection) return;

    const offer = JSON.parse(event.data);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (peerConnection.localDescription) {
      await api.negotiateConnection(
        roomId,
        clientId,
        peerConnection.localDescription
      );
    }
  });
};
