import { iceServers } from '@/_features/room/modules/constant';
import {
  sendIceCandidate,
  renegotiatePeer,
  joinRoom,
  leaveRoom,
} from '@/_features/room/modules/factory';
import { MediaManager } from '@/_features/room/modules/media';
import { EventManager } from '@/_features/room/modules/event';

type RoomParams = {
  roomId: string;
  clientId: string;
  baseUrl: string;
  media: MediaManager;
  event: EventManager;
};

export class Room {
  #roomId;
  #clientId;
  #peerConnection: RTCPeerConnection | null;
  #baseUrl;
  #event;
  #channel;
  media;

  static PARTICIPANT_ADDED = 'participantAdded';
  static PARTICIPANT_REMOVED = 'participantRemoved';

  constructor({
    roomId = '',
    clientId = '',
    baseUrl = '',
    media,
    event,
  }: RoomParams) {
    this.#roomId = roomId;
    this.#clientId = clientId;
    this.#baseUrl = baseUrl;
    this.#event = event;
    this.media = media;
    this.#peerConnection = new RTCPeerConnection({
      iceServers: iceServers,
    });
    this.#channel = new EventSource(
      `${this.#baseUrl}/rooms/${this.#roomId}/events/${this.#clientId} `
    );
  }

  connect() {
    this.#addListener();
    this.#addLocalTrack();
  }

  disconnect() {
    this.#closeConnection();
    this.#removeListener();
  }

  on(eventName: string, callback: (event: any) => any) {
    this.#event.on(eventName, callback);
  }

  getPeerConnection() {
    return this.#peerConnection;
  }

  #addListener() {
    window.addEventListener('beforeunload', this.#beforeUnloadHandler);

    if (!this.#peerConnection) return;

    this.#peerConnection.addEventListener(
      'iceconnectionstatechange',
      this.#peerIceconnectionStateChangeHandler
    );
    this.#peerConnection.addEventListener('track', this.#peerTrackHandler);
    this.#peerConnection.addEventListener(
      'icecandidate',
      this.#peerIceCandidateHandler
    );
    this.#peerConnection.addEventListener(
      'negotiationneeded',
      this.#peerNegotiationNeededHandler
    );
    this.#channel.addEventListener('candidate', this.#channelCandidateHandler);
    this.#channel.addEventListener('offer', this.#channelOfferHandler);
  }

  #removeListener() {
    window.removeEventListener('beforeunload', this.#beforeUnloadHandler);
  }

  #beforeUnloadHandler(event: BeforeUnloadEvent) {
    event.preventDefault();
    this.disconnect();
    leaveRoom(this.#roomId, this.#clientId);
  }

  #addLocalTrack() {
    const localStream = this.media.getLocalStream();

    for (const track of localStream.getTracks()) {
      if (this.#peerConnection) {
        this.#peerConnection.addTrack(track, localStream);
      }
    }

    this.#event.emit(Room.PARTICIPANT_ADDED, {
      stream: localStream,
      type: 'local',
    });
  }

  #addParticipant(stream: MediaStream, type: string) {
    this.media.addStream(stream);
    this.#event.emit(Room.PARTICIPANT_ADDED, {
      stream: stream,
      type: type,
    });
  }

  #channelCandidateHandler(event: MessageEvent<any>) {
    if (!this.#peerConnection || !this.#peerConnection.remoteDescription) {
      return;
    }

    const candidate = new RTCIceCandidate(JSON.parse(event.data));
    this.#peerConnection.addIceCandidate(candidate);
  }

  #channelOfferHandler(event: MessageEvent<any>) {
    (async (event) => {
      if (!this.#peerConnection) return;

      const offer = JSON.parse(event.data);
      await this.#peerConnection.setRemoteDescription(offer);
      const answer = await this.#peerConnection.createAnswer();

      await this.#peerConnection.setLocalDescription(answer);

      renegotiatePeer(
        this.#roomId,
        this.#clientId,
        this.#peerConnection.localDescription
      );
    })(event);
  }

  #peerIceconnectionStateChangeHandler() {
    if (this.#peerConnection) {
      console.log(
        'ice connection state changed to',
        this.#peerConnection.iceConnectionState
      );
    }
  }

  #peerTrackHandler(event: RTCTrackEvent) {
    const stream = event.streams.find((stream) => stream.active);

    if (!(stream instanceof MediaStream)) return;

    stream.addEventListener('removetrack', (event) => {
      const target = event.target;

      if (target instanceof MediaStream) {
        const remoteStreams = this.media.getRemoteStreams();

        if (target.id in remoteStreams && target.getTracks().length === 0) {
          const stream = target;
          this.media.removeStream(target.id);
          this.#event.emit(Room.PARTICIPANT_REMOVED, {
            stream: stream,
          });
        }
      }
    });

    const remoteStreams = this.media.getRemoteStreams();

    if (remoteStreams[stream.id] === undefined) {
      this.#addParticipant(stream, 'remote');
    }
  }

  #peerIceCandidateHandler(event: RTCPeerConnectionIceEvent) {
    (async ({ candidate }) => {
      if (candidate) {
        sendIceCandidate(this.#roomId, this.#clientId, candidate);
      }
    })(event);
  }

  #peerNegotiationNeededHandler() {
    (async () => {
      if (!this.#peerConnection) return;

      const offer = await this.#peerConnection.createOffer();
      await this.#peerConnection.setLocalDescription(offer);

      const response = await joinRoom(
        this.#roomId,
        this.#clientId,
        this.#peerConnection.localDescription
      );

      const data = response.data || {};
      const answer = data.answer;
      const sdpAnswer = new RTCSessionDescription(answer);
      await this.#peerConnection.setRemoteDescription(sdpAnswer);
    })();
  }

  #closeConnection() {
    if (this.#peerConnection) {
      const localStream = this.media.getLocalStream();

      for (const track of localStream.getTracks()) {
        track.stop();
      }

      for (const sender of this.#peerConnection.getSenders()) {
        this.#peerConnection.removeTrack(sender);
      }

      this.#peerConnection.close();
      this.#peerConnection = null;
    }
  }
}
