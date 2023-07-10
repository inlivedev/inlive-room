import { iceServers } from '@/_features/room/modules/constant';
import {
  sendIceCandidate,
  renegotiatePeer,
  joinRoom,
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
  #peerConnection;
  #baseUrl;
  #event;
  #channel;
  media;

  static ROOM_TRACK_ADDED = 'roomTrackAdded';

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

    this.#addListener();
    this.#addLocalTrack();
  }

  #addListener() {
    this.#peerConnection.addEventListener(
      'iceconnectionstatechange',
      (event) => {
        console.log('ice connection state change', event);
      }
    );

    this.#peerConnection.addEventListener('track', (event) => {
      console.log('track event', event);
      const streams = event.streams;
      const stream = event.streams[0];

      if (stream.id in streams) return;

      this.media.addStream(stream);
      this.#event.emit(Room.ROOM_TRACK_ADDED, {
        stream: stream,
      });
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
      const offer = await this.#peerConnection.createOffer();
      await this.#peerConnection.setLocalDescription(offer);

      const response = await joinRoom(
        this.#roomId,
        this.#clientId,
        this.#peerConnection.localDescription
      );

      console.log('response', response);

      const data = response.data || {};
      const answer = data.answer;
      const sdpAnswer = new RTCSessionDescription(answer);
      this.#peerConnection.setRemoteDescription(sdpAnswer);
    });

    this.#channel.addEventListener('candidate', (event) => {
      console.log('candidate event', event);
      const candidate = new RTCIceCandidate(JSON.parse(event.data));
      this.#peerConnection.addIceCandidate(candidate);
    });

    this.#channel.addEventListener('offer', async (event) => {
      console.log('offer event', event);
      const offer = JSON.parse(event.data);
      const promiseCreateAnswer = this.#peerConnection.createAnswer();
      const promiseSetRemoteDescription =
        this.#peerConnection.setRemoteDescription(offer);

      const [answer] = await Promise.all([
        promiseCreateAnswer,
        promiseSetRemoteDescription,
      ]);

      await this.#peerConnection.setLocalDescription(answer);

      if (this.#peerConnection.localDescription) {
        renegotiatePeer(
          this.#roomId,
          this.#clientId,
          this.#peerConnection.localDescription
        );
      }
    });
  }

  addStream(stream: MediaStream) {
    this.media.addStream(stream);
    this.#event.emit();
  }

  #addLocalTrack() {
    const localStream = this.media.getLocalStream();
    localStream.getTracks().forEach((track) => {
      this.#peerConnection.addTrack(track, localStream);
    });
    this.#event.emit(Room.ROOM_TRACK_ADDED, {
      stream: localStream,
    });
  }

  on(eventName: string, callback: (event: any) => any) {
    this.#event.on(eventName, callback);
  }

  getPeerConnection() {
    return this.#peerConnection;
  }
}
