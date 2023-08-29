class Channel {
  _roomId = '';
  _clientId = '';
  _baseUrl;
  _api;
  _peer;
  _channel: EventSource | null = null;

  constructor({ baseUrl, api, peer }: RoomChannelTypes.ChannelProps) {
    this._baseUrl = baseUrl;
    this._api = api;
    this._peer = peer;
  }

  connect(roomId: string, clientId: string) {
    if (this._channel) return;

    this._roomId = roomId;
    this._clientId = clientId;

    this._channel = new EventSource(
      `${this._baseUrl}/rooms/${this._roomId}/events/${this._clientId}`
    );

    this._channel.addEventListener('candidate', this._onCandidate);
    this._channel.addEventListener('offer', this._onOffer);
  }

  _onCandidate = async (event: MessageEvent<any>) => {
    const peerConnection = this._peer.getPeerConnection();

    if (!peerConnection || !peerConnection.remoteDescription) {
      return;
    }

    const candidate = new RTCIceCandidate(JSON.parse(event.data));
    await peerConnection.addIceCandidate(candidate);
  };

  _onOffer = async (event: MessageEvent<any>) => {
    if (!this._roomId || !this._clientId) return;

    const peerConnection = this._peer.getPeerConnection();

    if (!peerConnection) return;

    const offer = JSON.parse(event.data);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (peerConnection.localDescription) {
      await this._api.negotiateConnection(
        this._roomId,
        this._clientId,
        peerConnection.localDescription
      );
    }
  };
}

export const channelFactory = ({
  baseUrl,
  api,
  peer,
}: RoomChannelTypes.ChannelProps) => {
  const channel = new Channel({
    baseUrl,
    api,
    peer,
  });

  return {
    connect: channel.connect,
  };
};
