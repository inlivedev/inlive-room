import { Fetcher } from '@/_shared/utils/fetcher';

const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const hubBaseURL = `${hubOrigin}/${apiVersion}`;

const fetcher = Fetcher(hubBaseURL);

const createRoomFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (name = '') => {
    const response: SDKRoomAPITypes.CreateRoomResponseBody = await fetcher.post(
      `/rooms/create`,
      {
        body: JSON.stringify({ name: name }),
      }
    );

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
};

const getRoomFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (roomId = '') => {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.GetRoomResponseBody = await fetcher.get(
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
};

const registerClientFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (roomId = '') => {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.RegisterClientResponseBody =
      await fetcher.post(`/rooms/${roomId}/register`);

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
};

const sendIceCandidateFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (
    roomId = '',
    clientId = '',
    candidate: RTCIceCandidate | null = null
  ) => {
    if (!roomId || !clientId || !candidate) {
      throw new Error('Room ID, client ID, and RTC ice candidate are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await fetcher.post(
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
};

const checkNegotiateAllowedFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (roomId = '', clientId = '') => {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await fetcher.post(
      `/rooms/${roomId}/isallownegotiate/${clientId}`
    );

    const result = {
      code: response.code || 500,
      ok: response.ok || false,
      data: null,
    };

    return result;
  };
};

const negotiateConnectionFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (
    roomId = '',
    clientId = '',
    localDescription: RTCSessionDescription | null = null
  ) => {
    if (!roomId || !clientId || !localDescription) {
      throw new Error(
        'Room ID, client ID, and RTC local description are required'
      );
    }

    const response: SDKRoomAPITypes.NegotiateConnectionResponseBody =
      await fetcher.put(`/rooms/${roomId}/negotiate/${clientId}`, {
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
};

const leaveRoomFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (roomId = '', clientId = '') => {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await fetcher.delete(
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
};

const terminateRoomFactory = (fetcher: SDKRoomAPITypes.Fetcher) => {
  return async (roomId = '') => {
    if (typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a valid string');
    }

    const response: SDKRoomAPITypes.BaseResponseBody = await fetcher.put(
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

export const createRoom = createRoomFactory(fetcher);
export const getRoom = getRoomFactory(fetcher);
export const registerClient = registerClientFactory(fetcher);
export const sendIceCandidate = sendIceCandidateFactory(fetcher);
export const checkNegotiateAllowed = checkNegotiateAllowedFactory(fetcher);
export const negotiateConnection = negotiateConnectionFactory(fetcher);
export const leaveRoom = leaveRoomFactory(fetcher);
export const terminateRoom = terminateRoomFactory(fetcher);
