import { iceServers } from '../config/webrtc';

const PeerEvent = {
  STREAM_ADDED: 'streamAdded',
  STREAM_REMOVED: 'streamRemoved',
};

class Peer {
  _roomId = '';
  _clientId = '';
  _api;
  _event;
  _participant;
  _peerConnection: RTCPeerConnection | null = null;

  constructor({ api, event, participant }: RoomPeerTypes.PeerProps) {
    this._api = api;
    this._event = event;
    this._participant = participant;
  }

  connect(roomId: string, clientId: string) {
    this._roomId = roomId;
    this._clientId = clientId;

    this._peerConnection = new RTCPeerConnection({
      iceServers: iceServers,
    });

    this._peerConnection.addEventListener(
      'iceconnectionstatechange',
      this._onIceConnectionStateChange
    );

    this._peerConnection.addEventListener(
      'negotiationneeded',
      this._onNegotiationNeeded
    );

    this._peerConnection.addEventListener('icecandidate', this._onIceCandidate);
  }

  getPeerConnection() {
    return this._peerConnection;
  }

  addTrack(stream: MediaStream) {
    if (!this._peerConnection) return;

    if (stream instanceof MediaStream) {
      for (const track of stream.getTracks()) {
        this._peerConnection.addTrack(track, stream);
      }
    }
  }

  _onIceConnectionStateChange = () => {
    if (!this._peerConnection) return;

    console.log(
      'ice connection state changed to',
      this._peerConnection.iceConnectionState
    );
  };

  _onNegotiationNeeded = async () => {
    if (!this._roomId || !this._clientId) return;

    const allowNegotiateResponse = await this._api.checkNegotiateAllowed(
      this._roomId,
      this._clientId
    );

    if (allowNegotiateResponse.ok) {
      if (!this._peerConnection) return;

      const offer = await this._peerConnection.createOffer();
      await this._peerConnection.setLocalDescription(offer);

      if (this._peerConnection.localDescription) {
        const negotiateResponse = await this._api.negotiateConnection(
          this._roomId,
          this._clientId,
          this._peerConnection.localDescription
        );

        const { answer } = negotiateResponse.data;
        const sdpAnswer = new RTCSessionDescription(answer);
        await this._peerConnection.setRemoteDescription(sdpAnswer);
      }
    }
  };

  _onIceCandidate = async (event: RTCPeerConnectionIceEvent) => {
    if (!this._roomId || !this._clientId) return;

    const { candidate } = event;

    if (candidate) {
      await this._api.sendIceCandidate(this._roomId, this._clientId, candidate);
    }
  };
}

export const peerFactory = ({
  api,
  event,
  participant,
}: RoomPeerTypes.PeerFactoryProps) => {
  const peer = new Peer({
    api,
    event,
    participant,
  });

  return {
    event: PeerEvent,
    connect: peer.connect,
    getPeerConnection: peer.getPeerConnection,
    addTrack: peer.addTrack,
  };
};
