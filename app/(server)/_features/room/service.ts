import * as Sentry from '@sentry/nextjs';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { serverSDK } from '@/(server)/_shared/utils/sdk';
import { insertRoom, selectRoom } from './schema';
import { eventRepo } from '@/(server)/api/_index';
import { errorEventNotFound, errorParticipantNotFound } from './errors';

export interface Room {
  id: string;
  name?: string | null;
  createdBy: number;
  meta: { [key: string]: any };
}

export interface Client {
  clientID: string;
  name: string;
  roomID: string | null;
}

export interface iRoomRepo {
  addRoom(room: insertRoom): Promise<selectRoom>;
  getRoomById(id: string): Promise<insertRoom | undefined>;
  updateRoomById(room: Room): Promise<insertRoom | undefined>;
  isPersistent(): boolean;
}

export class RoomService {
  _roomRepo: iRoomRepo;
  _sdk = serverSDK;
  _datachannels: string[];

  constructor(roomRepo: iRoomRepo) {
    this._roomRepo = roomRepo;
    this._datachannels = ['chat', 'moderator'];
  }

  async createClient(
    roomId: string,
    clientName: string,
    clientID?: string
  ): Promise<Client> {
    if (!this._roomRepo.isPersistent()) {
      const clientResponse = await this._sdk.createClient(roomId, {
        clientName: clientName,
        enableVAD: true,
      });

      if (clientResponse && clientResponse.code === 409) {
        Sentry.captureMessage(
          `Failed to create client ID. The client ID already exists`,
          'error'
        );
        throw new Error(
          'Failed to create client ID. The client ID already exists'
        );
      }

      if (!clientResponse || !clientResponse.ok) {
        Sentry.captureMessage(
          `Failed to create client for the room ${roomId}.`,
          'error'
        );
        throw new Error(
          'Failed to create client for the room. Please try again later!'
        );
      }

      return {
        clientID: clientResponse.data.clientId,
        name: clientResponse.data.clientName,
        roomID: roomId,
      };
    }

    const roomData = await this._roomRepo.getRoomById(roomId);

    if (!roomData) {
      Sentry.captureMessage(
        `Room not found when trying to create a client`,
        'error'
      );
      throw new Error('Room not found');
    }

    if (roomData.meta.type === 'event') {
      const event = await eventRepo.getByRoomID(roomData.id);
      if (event) {
        if (!clientID) throw new Error('Client ID is required for event room');

        const participant = await eventRepo.getParticipantByClientId(clientID);

        if (!participant) throw errorParticipantNotFound;

        if (participant.eventID !== event.id) {
          throw errorParticipantNotFound;
        }
      }
    }

    const clientResponse = await this._sdk.createClient(roomData.id, {
      clientId: clientID,
      clientName: clientName,
      enableVAD: true,
    });

    if (clientResponse && clientResponse.code === 409 && clientID) {
      const existingClient = await this._sdk.getClient(roomData.id, clientID);

      const data: Client = {
        clientID: existingClient.data.clientId,
        name: existingClient.data.clientName,
        roomID: roomData.id,
      };

      return data;
    }

    if (!clientResponse || !clientResponse.ok) {
      Sentry.captureMessage(
        `Failed to create client for the room ${roomId}.`,
        'error'
      );
      throw new Error(
        'Failed to create client for the room. Please try again later!'
      );
    }

    const data: Client = {
      clientID: clientResponse.data.clientId,
      name: clientResponse.data.clientName,
      roomID: roomId,
    };

    return data;
  }

  async setClientName(
    roomID: string,
    clientID: string,
    name: string
  ): Promise<Client> {
    const updateResp = await this._sdk.setClientName(roomID, clientID, name);

    if (!updateResp || !updateResp.ok) {
      Sentry.captureMessage(
        `Failed to set a client name with ${name}.`,
        'error'
      );

      throw new Error(
        updateResp.message ||
          `An error has occured on our side. Please try again later!`
      );
    }

    return {
      clientID: updateResp.data.clientId,
      name: updateResp.data.clientName,
      roomID: roomID,
    };
  }

  async createRoom(
    userID: number,
    type: 'event' | 'meeting'
  ): Promise<selectRoom> {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      const roomID = generateID();
      const roomResp = await this._sdk.createRoom('', roomID);

      if (roomResp.code == 409) {
        retries++;
        continue;
      }

      if (roomResp.code > 299) {
        Sentry.captureMessage(`Failed to create a room ${roomID}.`, 'error');
        throw new Error('Error during creating room, please try again later');
      }

      for (const datachannel of this._datachannels) {
        const channelResponse = await this._sdk.createDataChannel(
          roomResp.data.id,
          datachannel,
          true
        );

        if (!channelResponse || !channelResponse.ok) {
          Sentry.captureException(
            new Error(
              `Failed to create ${datachannel} data channel with room ID ${roomID}`
            )
          );
        }
      }

      if (!this._roomRepo.isPersistent()) {
        return {
          id: roomResp.data.id,
          createdBy: userID,
          meta: { type },
          name: '',
          createdAt: new Date(),
        };
      }

      try {
        const room = await this._roomRepo.addRoom({
          id: roomResp.data.id,
          createdBy: userID,
          meta: { type },
        });

        return room;
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message: `Failed to add a room to the DB.`,
          },
        });

        if (error instanceof Error) {
          if (error.message.includes('duplicate key')) {
            retries++;
            continue;
          } else {
            throw error;
          }
        }
      }
    }

    Sentry.captureMessage(
      `Failed to create a room. Has reached max retries: ${maxRetries} retries`,
      'error'
    );

    throw new Error(
      'Failed to create a unique room ID. Please try again later!'
    );
  }

  async joinRoom(roomId: string) {
    if (!this._roomRepo.isPersistent()) {
      let room;

      const remoteRoom = await this._sdk.getRoom(roomId);
      if (remoteRoom.ok) {
        room = {
          id: remoteRoom.data.id,
          name: remoteRoom.data.name,
          createdBy: 0,
        } as Room;
      }

      return { room, event: undefined };
    }

    const roomPromise = this._roomRepo.getRoomById(roomId);
    const remoteRoomPromise = this._sdk.getRoom(roomId);

    const [room, remoteRoom] = await Promise.all([
      roomPromise,
      remoteRoomPromise,
    ]);

    if (room && room.id && remoteRoom.code === 404) {
      const newRemoteRoom = await this._sdk.createRoom('', room.id);

      if (!newRemoteRoom || !newRemoteRoom.ok) {
        Sentry.captureMessage(
          `Failed to create a room. ${newRemoteRoom.code} ${newRemoteRoom.message}`,
          'error'
        );
        throw new Error(
          'Error occured during accessing room data, please try again later'
        );
      }

      for (const datachannel of this._datachannels) {
        const channelResponse = await this._sdk.createDataChannel(
          room.id,
          datachannel,
          true
        );

        if (!channelResponse || !channelResponse.ok) {
          Sentry.captureMessage(
            `Failed to create ${datachannel} data channel with room ID ${roomId}`,
            'error'
          );
        }
      }
    }

    if (room && room.meta.type === 'event') {
      const event = await eventRepo.getByRoomID(room.id);

      return { room, event };
    }

    return { room, event: undefined };
  }
}
