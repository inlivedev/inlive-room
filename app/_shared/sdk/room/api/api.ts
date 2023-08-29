import { Fetcher } from './fetcher';

class Api {
  _fetcher;

  constructor(fetcher: SDKRoomAPITypes.ReturnFetcher) {
    this._fetcher = fetcher;
  }

  async createRoom(name = '') {
    const response: SDKRoomAPITypes.CreateRoomResponseBody =
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
  }

  async getRoom(roomId = '') {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.GetRoomResponseBody =
      await this._fetcher.get(`/rooms/${roomId}`);

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
  }

  async registerClient(roomId = '') {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.RegisterClientResponseBody =
      await this._fetcher.post(`/rooms/${roomId}/register`);

    const data = response.data || {};

    const client = {
      code: response.code || 500,
      ok: response.ok || false,
      data: {
        clientId: data.client_id || '',
      },
    };

    return client;
  }

  async sendIceCandidate(
    roomId = '',
    clientId = '',
    candidate: RTCIceCandidate | null = null
  ) {
    if (!roomId || !clientId || !candidate) {
      throw new Error('Room ID, client ID, and RTC ice candidate are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await this._fetcher.post(
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
  }

  async checkNegotiateAllowed(roomId = '', clientId = '') {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await this._fetcher.post(
      `/rooms/${roomId}/isallownegotiate/${clientId}`
    );

    const result = {
      code: response.code || 500,
      ok: response.ok || false,
      data: null,
    };

    return result;
  }

  async negotiateConnection(
    roomId = '',
    clientId = '',
    localDescription: RTCSessionDescription | null = null
  ) {
    if (!roomId || !clientId || !localDescription) {
      throw new Error(
        'Room ID, client ID, and RTC local description are required'
      );
    }

    const response: SDKRoomAPITypes.NegotiateConnectionResponseBody =
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
  }

  async leaveRoom(roomId = '', clientId = '') {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody =
      await this._fetcher.delete(`/rooms/${roomId}/leave/${clientId}`, {
        keepalive: true,
      });

    const result = {
      code: response.code || 500,
      ok: response.ok || false,
      data: null,
    };

    return result;
  }

  async terminateRoom(roomId = '') {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await this._fetcher.put(
      `/rooms/${roomId}/end`
    );

    const result = {
      code: response.code || 500,
      ok: response.ok || false,
      data: null,
    };

    return result;
  }
}

export const apiFactory = () => {
  return {
    create(baseURL = '') {
      const fetcher = Fetcher(baseURL);
      const api = new Api(fetcher);

      return {
        createRoom: api.createRoom,
        getRoom: api.getRoom,
        registerClient: api.registerClient,
        sendIceCandidate: api.sendIceCandidate,
        checkNegotiateAllowed: api.checkNegotiateAllowed,
        negotiateConnection: api.negotiateConnection,
        leaveRoom: api.leaveRoom,
        terminateRoom: api.terminateRoom,
      };
    },
  };
};
