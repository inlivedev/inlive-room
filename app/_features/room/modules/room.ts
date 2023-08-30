import { iceServers } from '@/_features/room/modules/constant';
import {
  sendIceCandidate,
  renegotiatePeer,
  joinRoom,
  allowRenegotation,
  leaveRoom,
  setTrackSources,
  subscribeTracks,
} from '@/_features/room/modules/factory';

import type {
  TrackSources,
  SubscribeTracksRequestType,
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
  #pendingNegotation: boolean;
  #inRenegotiation: boolean;
  #baseUrl;
  #event;
  #channel;
  media;

  static PARTICIPANT_ADDED = 'participantAdded';
  static PARTICIPANT_REMOVED = 'participantRemoved';
  static PARTICIPANT_CAMERA_MUTED = 'participantCameraMuted';
  static PARTICIPANT_CAMERA_UNMUTED = 'participantCameraUnmuted';
  static PARTICIPANT_MICROPHONE_MUTED = 'participantMicrophoneMuted';
  static PARTICIPANT_MICROPHONE_UNMUTED = 'participantMicrophoneUnmuted';

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
    this.#pendingNegotation = false;
    this.#inRenegotiation = false;
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
      const localStreams = this.media.getLocalStreams();

      for (const id in localStreams) {
        for (const track of localStreams[id].stream.getTracks()) {
          this.#stopTrack(track);
        }
      }

      for (const sender of this.#peerConnection.getSenders()) {
        if (!sender.track) return;
        this.#stopTrack(sender.track);
      }

      this.#peerConnection.close();
      this.#peerConnection = null;
    }

    this.#removeListener();
  }

  #addListener() {
    window.addEventListener('beforeunload', this.#beforeUnloadHandler);

    if (!this.#peerConnection) return;

    this.#peerConnection.addEventListener(
      'iceconnectionstatechange',
      async () => {
        if (!this.#peerConnection) return;

        const { iceConnectionState } = this.#peerConnection;

        console.log(
          'ice connection state changed to',
          this.#peerConnection.iceConnectionState
        );

        if (iceConnectionState === 'failed') {
          await this.renegotiate({
            iceRestart: true,
          });
        }
      }
    );

    this.#peerConnection.addEventListener('track', (event) => {
      const stream = event.streams.find((stream) => stream.active);

      const track = event.track;

      track.addEventListener('ended', () => {
        console.log('remote track ended');
      });

      track.addEventListener('mute', (event) => {
        console.log('mute event', track, event);
      });

      track.addEventListener('unmute', (event) => {
        console.log('unmute event', track, event);
      });

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
        this.addStream(stream);
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

      try {
        // won't throw an error if allowed
        if (this.#pendingNegotation) {
          // previously not allowed because we're waiting for this offer
          // this event is a repeat event after previously rollbacked
          console.log('negotiation needed after a pending negotiation');
          this.#pendingNegotation = false;
        } else if (this.#inRenegotiation) {
          // there is a renegotiation in progress
          console.log(
            'negotiation in progress, canceling on negotiation needed'
          );
          this.#pendingNegotation = true;
          return;
        } else {
          const allowed = await allowRenegotation(this.#roomId, this.#clientId);
          if (!allowed) {
            this.#pendingNegotation = true;
            return;
          }
        }
      } catch (error) {
        // will try an error if not allowed
        console.error(error);
      }

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

    this.#channel.addEventListener('allowed_renegotation', async (event) => {
      // you can do the renegotation here
      console.log('allowed_renegotation', event);
    });

    this.#channel.addEventListener('offer', async (event) => {
      this.#inRenegotiation = true;

      console.log('get renegotiation offer');

      if (!this.#peerConnection) return;

      const offer = JSON.parse(event.data);
      await this.#peerConnection.setRemoteDescription(offer);
      await this.#peerConnection.setLocalDescription();

      renegotiatePeer(
        this.#roomId,
        this.#clientId,
        this.#peerConnection.localDescription
      );

      this.#inRenegotiation = false;
    });

    this.#channel.addEventListener('tracks_added', async (event) => {
      const data = JSON.parse(event.data);
      const trackSources: TrackSources = [];
      Object.keys(data.tracks).forEach((id) => {
        const track = data.tracks[id];
        trackSources.push({
          track_id: id,
          source: this.media.getLocalStreamSource(track.stream_id),
        });
      });

      setTrackSources(this.#roomId, this.#clientId, trackSources);
    });

    this.#channel.addEventListener('tracks_available', async (event) => {
      const data = JSON.parse(event.data);
      console.log('tracks_available', data);
      const tracksSubscribe: SubscribeTracksRequestType = [];
      Object.keys(data.tracks).forEach((id) => {
        const track = data.tracks[id];
        tracksSubscribe.push({
          client_id: track.client_id,
          stream_id: track.stream_id,
          track_id: track.track_id,
        });

        this.media.addAvailableStream(
          track.client_id,
          track.stream_id,
          track.source
        );
      });

      subscribeTracks(this.#roomId, this.#clientId, tracksSubscribe);
    });
  }

  #removeListener() {
    window.removeEventListener('beforeunload', this.#beforeUnloadHandler);
  }

  #beforeUnloadHandler = async () => {
    this.disconnect();
    leaveRoom(this.#roomId, this.#clientId);
  };

  addStream(stream: MediaStream) {
    this.media.addStream(stream);
    this.#event.emit(Room.PARTICIPANT_ADDED, {
      stream: stream,
      type: 'remote',
      source: this.media.getStreamSource(stream.id),
    });
  }

  addLocalStream(stream: MediaStream, sourceType: string) {
    this.media.addLocalStream(stream, sourceType);
    this.#event.emit(Room.PARTICIPANT_ADDED, {
      stream: stream,
      type: 'local',
      source: sourceType,
    });
  }

  removeLocalStream(stream: MediaStream) {
    this.media.removeLocalStream(stream.id);
    this.#event.emit(Room.PARTICIPANT_REMOVED, {
      stream: stream,
      type: 'local',
    });
  }

  removeStream(stream: MediaStream) {
    this.media.removeStream(stream.id);
    this.#event.emit(Room.PARTICIPANT_REMOVED, {
      stream: stream,
    });
  }

  #addLocalTrack() {
    const localStreams = this.media.getLocalStreams();

    for (const id in localStreams) {
      for (const track of localStreams[id].stream.getTracks()) {
        if (this.#peerConnection) {
          this.#peerConnection.addTrack(track, localStreams[id].stream);
        }
      }

      this.#event.emit(Room.PARTICIPANT_ADDED, {
        stream: localStreams[id].stream,
        type: 'local',
        source: localStreams[id].source,
      });
    }
  }

  on(eventName: string, callback: (event: any) => any) {
    this.#event.on(eventName, callback);
  }

  getPeerConnection() {
    return this.#peerConnection;
  }

  async renegotiate({ iceRestart }: { iceRestart: boolean }) {
    if (!this.#peerConnection) return;

    const offer = await this.#peerConnection.createOffer({
      iceRestart: iceRestart,
    });
    await this.#peerConnection.setLocalDescription(offer);

    await renegotiatePeer(
      this.#roomId,
      this.#clientId,
      this.#peerConnection.localDescription
    );
  }

  #stopTrack(track: MediaStreamTrack) {
    if (track instanceof MediaStreamTrack) {
      track.enabled = false;
      track.stop();
    }
  }

  turnOffMic() {
    if (this.#peerConnection) {
      for (const sender of this.#peerConnection.getSenders()) {
        if (!sender.track) return;

        if (sender.track.kind === 'audio') {
          this.#stopTrack(sender.track);
        }
      }
    }
  }

  async turnOnMic() {
    if (this.#peerConnection) {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      for (const track of localStream.getAudioTracks()) {
        for (const sender of this.#peerConnection.getSenders()) {
          if (!sender.track) return;

          if (sender.track.kind === track.kind) {
            sender.replaceTrack(track);
          }
        }
      }
    }
  }

  turnOffCamera() {
    if (this.#peerConnection) {
      for (const sender of this.#peerConnection.getSenders()) {
        if (!sender.track) return;

        if (sender.track.kind === 'video') {
          this.#stopTrack(sender.track);
        }
      }
    }
  }

  async turnOnCamera() {
    if (this.#peerConnection) {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      for (const track of localStream.getVideoTracks()) {
        for (const sender of this.#peerConnection.getSenders()) {
          if (!sender.track) return;

          if (sender.track.kind === track.kind) {
            sender.replaceTrack(track);
          }
        }
      }
    }
  }
}
