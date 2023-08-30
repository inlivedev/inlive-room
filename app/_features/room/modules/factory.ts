import { Fetch } from '@/_shared/lib/fetch';
import type { TypeFetch } from '@/_shared/lib/fetch';

const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const hubBaseURL = `${hubOrigin}/${apiVersion}`;

const fetcher = new Fetch(hubBaseURL);

type CreateRoomDataType = {
  id: string;
};

type RegisterClientDataType = {
  client_id: string;
};

type TrackSource = {
  track_id: string;
  source: string;
};

export type TrackSources = TrackSource[];

type SubscribeTrackRequestType = {
  client_id: string;
  stream_id: string;
  track_id: string;
};
export type SubscribeTracksRequestType = SubscribeTrackRequestType[];

const createRoomFactory = (fetcher: TypeFetch) => {
  return async (name = '') => {
    const response = await fetcher.post(`/rooms/create`, {
      body: JSON.stringify({ name: name }),
    });

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    const data: CreateRoomDataType = response.data || {};

    const room = {
      code: parseInt(response.code, 10) || 500,
      data: {
        roomId: data.id || '',
      },
    };

    return room;
  };
};

const registerClientFactory = (fetcher: TypeFetch) => {
  return async (roomId = '') => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    const response = await fetcher.post(`/rooms/${roomId}/register`);

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    const data: RegisterClientDataType = response.data || {};
    const client = {
      clientId: data.client_id || '',
    };

    return client;
  };
};

const sendIceCandidateFactory = (fetcher: TypeFetch) => {
  return async (
    roomId = '',
    clientId = '',
    candidate: RTCIceCandidate | null = null
  ) => {
    if (!roomId || !clientId || !candidate) {
      throw new Error('Room ID, client ID, RTC ice candidate are required');
    }

    const response = await fetcher.post(
      `/rooms/${roomId}/candidate/${clientId}`,
      {
        body: JSON.stringify(candidate.toJSON()),
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    return response;
  };
};

const renegotiatePeerFactory = (fetcher: TypeFetch) => {
  return async (
    roomId = '',
    clientId = '',
    localDescription: RTCSessionDescription | null = null
  ) => {
    if (!roomId || !clientId || !localDescription) {
      throw new Error('Room ID, client ID, RTC local description are required');
    }

    const response = await fetcher.put(
      `/rooms/${roomId}/negotiate/${clientId}`,
      {
        body: JSON.stringify(localDescription.toJSON()),
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    return response;
  };
};

const allowRenegotationFactory = (fetcher: TypeFetch) => {
  return async (roomId = '', clientId = ''): Promise<boolean> => {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    try {
      const response = await fetcher.post(
        `/rooms/${roomId}/isallownegotiate/${clientId}`
      );

      if (!response) {
        throw new Error('Something went wrong. Please try again later!');
      }
    } catch (error) {
      return false;
    }

    return true;
  };
};

const joinRoomFactory = (fetcher: TypeFetch) => {
  return async (
    roomId = '',
    clientId = '',
    localDescription: RTCSessionDescription | null = null
  ) => {
    if (!roomId || !clientId || !localDescription) {
      throw new Error('Room ID, client ID, RTC local description are required');
    }

    const response = await fetcher.put(
      `/rooms/${roomId}/negotiate/${clientId}`,
      {
        body: JSON.stringify(localDescription.toJSON()),
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    return response;
  };
};

const leaveRoomFactory = (fetcher: TypeFetch) => {
  return async (roomId = '', clientId = '') => {
    if (!roomId || !clientId) {
      throw new Error('Room ID, and client ID are required');
    }

    const response = await fetcher.delete(
      `/rooms/${roomId}/leave/${clientId}`,
      {
        keepalive: true,
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    const result = {
      code: parseInt(response.code, 10) || 500,
    };

    return result;
  };
};

const terminateRoomFactory = (fetcher: TypeFetch) => {
  return async (roomId: string) => {
    if (roomId) {
      const response = await fetcher.put(`/rooms/${roomId}/end`);

      if (!response) {
        throw new Error('Something went wrong. Please try again later!');
      }

      const result = {
        code: parseInt(response.code, 10) || 500,
      };

      return result;
    }
  };
};

const setTrackSourcesFactory = (fetcher: TypeFetch) => {
  return async (
    roomId: string,
    clientId: string,
    trackSources: TrackSources
  ) => {
    const response = await fetcher.put(
      `/rooms/${roomId}/settracksources/${clientId}`,
      {
        body: JSON.stringify(trackSources),
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    const result = {
      code: parseInt(response.code, 10) || 500,
    };

    return result;
  };
};

const subscribeTracksFactory = (fetcher: TypeFetch) => {
  return async (
    roomId: string,
    clientId: string,
    subscribeTracks: SubscribeTracksRequestType
  ) => {
    const response = await fetcher.post(
      `/rooms/${roomId}/subscribetracks/${clientId}`,
      {
        body: JSON.stringify(subscribeTracks),
      }
    );

    if (!response) {
      throw new Error('Something went wrong. Please try again later!');
    }

    const result = {
      code: parseInt(response.code, 10) || 500,
    };

    return result;
  };
};

export const createRoom = createRoomFactory(fetcher);
export const registerClient = registerClientFactory(fetcher);
export const sendIceCandidate = sendIceCandidateFactory(fetcher);
export const renegotiatePeer = renegotiatePeerFactory(fetcher);
export const allowRenegotation = allowRenegotationFactory(fetcher);
export const joinRoom = joinRoomFactory(fetcher);
export const leaveRoom = leaveRoomFactory(fetcher);
export const terminateRoom = terminateRoomFactory(fetcher);
export const setTrackSources = setTrackSourcesFactory(fetcher);
export const subscribeTracks = subscribeTracksFactory(fetcher);
