export const createApi = ({ fetcher }: RoomAPIType.ApiDependencies) => {
  const Api = class {
    _fetcher;

    constructor() {
      this._fetcher = fetcher;
    }

    createRoom = async (name = '') => {
      const response: RoomAPIType.CreateRoomResponseBody =
        await this._fetcher.post(`/rooms/create`, {
          body: JSON.stringify({ name: name }),
        });

      const data = response.data || {};

      const room = {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          roomId: data.id || '',
        },
      };

      return room;
    };

    getRoom = async (roomId: string) => {
      if (typeof roomId !== 'string' || roomId.trim().length === 0) {
        throw new Error('Room ID must be a valid string');
      }

      const response: RoomAPIType.GetRoomResponseBody = await this._fetcher.get(
        `/rooms/${roomId}`
      );

      const data = response.data || {};

      const room = {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          roomId: data.id || '',
          roomName: data.name || '',
        },
      };

      return room;
    };

    registerClient = async (roomId: string, clientId = '') => {
      if (typeof roomId !== 'string' || roomId.trim().length === 0) {
        throw new Error('Room ID must be a valid string');
      }

      if (typeof clientId !== 'string') {
        throw new Error('Client ID must be a valid string');
      }

      const body = clientId.trim().length > 0 ? { uid: clientId } : {};

      const response: RoomAPIType.RegisterClientResponseBody =
        await this._fetcher.post(`/rooms/${roomId}/register`, {
          body: JSON.stringify(body),
        });

      const data = response.data || {};

      const client = {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          clientId: data.client_id || '',
        },
      };

      return client;
    };

    sendIceCandidate = async (
      roomId: string,
      clientId: string,
      candidate: RTCIceCandidate | null = null
    ) => {
      if (!roomId || !clientId || !candidate) {
        throw new Error(
          'Room ID, client ID, and RTC ice candidate are required'
        );
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.post(
        `/rooms/${roomId}/candidate/${clientId}`,
        {
          body: JSON.stringify(candidate.toJSON()),
        }
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };

    checkNegotiateAllowed = async (roomId: string, clientId: string) => {
      if (!roomId || !clientId) {
        throw new Error('Room ID, and client ID are required');
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.post(
        `/rooms/${roomId}/isallownegotiate/${clientId}`
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };

    negotiateConnection = async (
      roomId: string,
      clientId: string,
      localDescription: RTCSessionDescription | null = null
    ) => {
      if (!roomId || !clientId || !localDescription) {
        throw new Error(
          'Room ID, client ID, and RTC local description are required'
        );
      }

      const response: RoomAPIType.NegotiateConnectionResponseBody =
        await this._fetcher.put(`/rooms/${roomId}/negotiate/${clientId}`, {
          body: JSON.stringify(localDescription.toJSON()),
        });

      const data = response.data || {};

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          answer: data.answer,
        },
      };

      return result;
    };

    setTrackSources = async (
      roomId: string,
      clientId: string,
      trackSources: RoomAPIType.TrackSourcesRequestBody[]
    ) => {
      if (!roomId || !clientId) {
        throw new Error('Room ID, and client ID are required');
      }

      if (!Array.isArray(trackSources)) {
        throw new Error(
          'Third parameters must be a valid array of objects with source and track_id properties'
        );
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.put(
        `/rooms/${roomId}/settracksources/${clientId}`,
        {
          body: JSON.stringify(trackSources),
        }
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };

    subscribeTracks = async (
      roomId: string,
      clientId: string,
      subscribeTracks: RoomAPIType.SubscribeTracksRequestBody[]
    ) => {
      if (!roomId || !clientId) {
        throw new Error('Room ID, and client ID are required');
      }

      if (!Array.isArray(subscribeTracks)) {
        throw new Error(
          'Third parameters must be a valid array of objects with client_id, stream_id, and track_id properties'
        );
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.post(
        `/rooms/${roomId}/subscribetracks/${clientId}`,
        {
          body: JSON.stringify(subscribeTracks),
        }
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };

    leaveRoom = async (roomId: string, clientId: string) => {
      if (!roomId || !clientId) {
        throw new Error('Room ID, and client ID are required');
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.delete(
        `/rooms/${roomId}/leave/${clientId}`,
        {
          keepalive: true,
        }
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };

    terminateRoom = async (roomId: string) => {
      if (typeof roomId !== 'string' || roomId.trim().length === 0) {
        throw new Error('Room ID must be a valid string');
      }

      const response: RoomAPIType.BaseResponseBody = await this._fetcher.put(
        `/rooms/${roomId}/end`
      );

      const result = {
        code: response.code || 500,
        ok: response.ok || false,
        data: null,
      };

      return result;
    };
  };

  return {
    createInstance: () => {
      const api = new Api();

      return {
        createRoom: api.createRoom,
        getRoom: api.getRoom,
        registerClient: api.registerClient,
        sendIceCandidate: api.sendIceCandidate,
        checkNegotiateAllowed: api.checkNegotiateAllowed,
        negotiateConnection: api.negotiateConnection,
        setTrackSources: api.setTrackSources,
        subscribeTracks: api.subscribeTracks,
        leaveRoom: api.leaveRoom,
        terminateRoom: api.terminateRoom,
      };
    },
  };
};
