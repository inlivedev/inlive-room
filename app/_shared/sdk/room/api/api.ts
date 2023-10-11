export const createApi = ({ fetcher }: RoomAPIType.ApiDependencies) => {
  const Api = class {
    _fetcher;

    constructor() {
      this._fetcher = fetcher;
    }

    createRoom = async (name = '', id?: string) => {
      const response: RoomAPIType.CreateRoomResponseBody =
        await this._fetcher.post(`/rooms/create`, {
          body: JSON.stringify({ name: name, id: id }),
        });

      const data = response.data || {};

      const room = {
        message: response.message || '',
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          roomId: data.room_id || '',
          roomName: data.name || '',
          bitratesConfig: data.bitrates_config || {},
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
          roomId: data.room_id || '',
          roomName: data.name || '',
        },
      };

      return room;
    };

    updateClientName = async (
      roomID: string,
      clientID: string,
      name: string
    ) => {
      if (roomID.trim().length === 0) {
        throw new Error('Room ID must be a valid string');
      }

      if (clientID.trim().length === 0) {
        throw new Error('Client ID must be a valid string');
      }

      if (name.trim().length === 0) {
        throw new Error("Client name can't be empty");
      }

      const response: RoomAPIType.UpdateClientNameResponse =
        await this._fetcher.put(`rooms/${roomID}/setname/${clientID}`, {
          body: JSON.stringify({
            name: name,
          }),
        });

      return {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          clientId: response.data.client_id,
          name: response.data.name,
          bitratesConfig: response.data.bitrates,
        },
        message: response.message,
      };
    };

    registerClient = async (
      roomId: string,
      config: { clientId?: string; clientName?: string } = {}
    ) => {
      if (typeof roomId !== 'string' || roomId.trim().length === 0) {
        throw new Error('Room ID must be a valid string');
      }

      const body: RoomAPIType.RegisterClientRequestBody = {};

      if (config.clientId) {
        body.uid = config.clientId;
      }

      if (config.clientName) {
        body.name = config.clientName;
      }

      const options =
        body.uid || body.name ? { body: JSON.stringify(body) } : undefined;

      const response: RoomAPIType.RegisterClientResponseBody =
        await this._fetcher.post(`/rooms/${roomId}/register`, options);

      const data = response.data || {};

      const client = {
        code: response.code || 500,
        ok: response.ok || false,
        data: {
          clientId: data.client_id || '',
          name: data.name || '',
          bitratesConfig: data.bitrates || {},
        },
        message: response.message,
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

    createDataChannel = async (
      roomId: string,
      name: string,
      ordered: boolean
    ) => {
      const response: RoomAPIType.BaseResponseBody = await this._fetcher.post(
        `/room/${roomId}/channel/create`,
        {
          body: JSON.stringify({ name: name, ordered: ordered }),
        }
      );

      return {
        code: response.code || 500,
        ok: response.ok || false,
        message: response.message || '',
        data: null,
      };
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
        createDataChannel: api.createDataChannel,
        updateClientName: api.updateClientName,
      };
    },
  };
};
