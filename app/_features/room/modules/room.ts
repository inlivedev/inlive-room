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

  #addListener() {
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();

      (() => {
        this.disconnect();
        leaveRoom(this.#roomId, this.#clientId);
      })();
    });

    if (!this.#peerConnection) return;

    this.#peerConnection.addEventListener('iceconnectionstatechange', () => {
      if (this.#peerConnection) {
        console.log(
          'ice connection state changed to',
          this.#peerConnection.iceConnectionState
        );
      }
    });

    this.#peerConnection.addEventListener('track', (event) => {
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
        this.addStream(stream, 'remote');
      }
    });

    this.#peerConnection.addEventListener(
      'icecandidate',
      async ({ candidate }) => {
        if (candidate) {
          sendIceCandidate(this.#roomId, this.#clientId, candidate);
        }
      }
    );

    this.#peerConnection.addEventListener('negotiationneeded', async () => {
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
    });

    this.#channel.addEventListener('candidate', (event) => {
      if (!this.#peerConnection || !this.#peerConnection.remoteDescription) {
        return;
      }

      const candidate = new RTCIceCandidate(JSON.parse(event.data));
      this.#peerConnection.addIceCandidate(candidate);
    });

    this.#channel.addEventListener('offer', async (event) => {
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
    });
  }

  addStream(stream: MediaStream, type: string) {
    this.media.addStream(stream);
    this.#event.emit(Room.PARTICIPANT_ADDED, {
      stream: stream,
      type: type,
    });
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

  on(eventName: string, callback: (event: any) => any) {
    this.#event.on(eventName, callback);
  }

  getPeerConnection() {
    return this.#peerConnection;
  }
}
