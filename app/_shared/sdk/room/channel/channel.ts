class Channel {
  _roomId = '';
  _clientId = '';
  _baseUrl;
  _api;
  _peer;
  _stream;
  _channel: EventSource | null = null;

  constructor({ baseUrl, api, peer, stream }: RoomChannelType.ChannelProps) {
    this._baseUrl = baseUrl;
    this._api = api;
    this._peer = peer;
    this._stream = stream;
  }

  connect = (roomId: string, clientId: string) => {
    if (this._channel) return;

    this._roomId = roomId;
    this._clientId = clientId;

    this._channel = new EventSource(
      `${this._baseUrl}/rooms/${this._roomId}/events/${this._clientId}`
    );

    this._channel.addEventListener('candidate', this._onCandidate);
    this._channel.addEventListener('offer', this._onOffer);
    this._channel.addEventListener('tracks_added', this._onTracksAdded);
    this._channel.addEventListener('tracks_available', this._onTracksAvailable);
  };

  _onCandidate = async (event: MessageEvent<any>) => {
    const peerConnection = this._peer.getPeerConnection();

    if (!peerConnection || !peerConnection.remoteDescription) {
      return;
    }

    const candidate = new RTCIceCandidate(JSON.parse(event.data));
    peerConnection.addIceCandidate(candidate);
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
      this._api.negotiateConnection(
        this._roomId,
        this._clientId,
        peerConnection.localDescription
      );
    }
  };

  _onTracksAdded = async (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data);
    const trackSources: RoomChannelType.TrackSource[] = [];

    for (const id of Object.keys(data.tracks)) {
      const track = data.tracks[id];
      const streamId = track.stream_id;
      const stream = this._peer.getStream(streamId);

      if (stream) {
        trackSources.push({
          track_id: id,
          source: stream.source,
        });
      }
    }

    this._api.setTrackSources(this._roomId, this._clientId, trackSources);
  };

  _onTracksAvailable = async (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data);
    const subscribingTracks: RoomChannelType.SubscribingTrack[] = [];

    for (const id of Object.keys(data.tracks)) {
      const track = data.tracks[id];
      const streamId = track.stream_id;
      const clientId = track.client_id;
      const trackId = track.track_id;
      const source = track.source;

      subscribingTracks.push({
        client_id: clientId,
        stream_id: streamId,
        track_id: trackId,
      });

      this._stream.addDraft(streamId, {
        origin: 'remote',
        source: source,
      });
    }

    this._api.subscribeTracks(this._roomId, this._clientId, subscribingTracks);
  };
}

export const channelFactory = ({
  baseUrl,
  api,
  peer,
  stream,
}: RoomChannelType.ChannelProps) => {
  const channel = new Channel({
    baseUrl,
    api,
    peer,
    stream,
  });

  return {
    connect: channel.connect,
  };
};
