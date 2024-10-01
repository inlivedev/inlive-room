import * as Sentry from '@sentry/nextjs';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { getServerSDK } from '@/(server)/_shared/utils/sdk';
import { insertRoom, selectRoom } from './schema';
import { eventRepo, roomRepo } from '@/(server)/api/_index';
import { ServiceError } from '../_service';
import { selectCategory, selectEvent } from '../event/schema';

export type Room = {
  id: string;
  name: string | null;
  createdAt?: Date;
  createdBy?: number;
  meta?: any;
} & {
  event?:
    | selectEvent & {
        category?: selectCategory;
      };
};

export interface Client {
  clientID: string;
  name: string;
  roomID: string | null;
}

export interface iRoomRepo {
  addRoom(room: insertRoom): Promise<selectRoom | undefined>;
  getRoomById(id: string): Promise<insertRoom | undefined>;
  updateRoomById(room: Room): Promise<insertRoom | undefined>;
  isPersistent(): boolean;
}

export class RoomService {
  _roomRepo: iRoomRepo;
  _datachannels: string[];
  _sdk: null | Awaited<ReturnType<typeof getServerSDK>>;

  constructor(roomRepo: iRoomRepo) {
    this._roomRepo = roomRepo;
    this._datachannels = ['chat', 'moderator'];
    this._sdk = null;
  }

  async getSDK() {
    if (this._sdk) return this._sdk;

    this._sdk = await getServerSDK();

    return this._sdk;
  }

  async createClient(
    roomId: string,
    clientName: string,
    clientID?: string
  ): Promise<Client> {
    const sdk = await this.getSDK();

    if (!sdk) {
      throw new ServiceError('RoomService', 'sdk not initialized', 500);
    }

    if (!this._roomRepo.isPersistent()) {
      const clientResponse = await sdk.createClient(roomId, {
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

        console.error(clientResponse);
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

    const event = await eventRepo.getByRoomID(roomId);

    if (event) {
      if (event.category?.name != 'meetings') {
        if (!clientID) throw new Error('Client ID is required for event room');

        const participant = await eventRepo.getParticipantByClientId(clientID);

        if (!participant) {
          throw new ServiceError(
            'EventError',
            'Client ID does not match any participant',
            400
          );
        }

        if (participant.eventID !== event.id) {
          throw new ServiceError(
            'EventError',
            'Client ID does not match the event room',
            400
          );
        }
      }
    }

    const clientResponse = await sdk.createClient(roomData.id, {
      clientId: clientID,
      clientName: clientName,
      enableVAD: true,
    });

    if (clientResponse && clientResponse.code === 409 && clientID) {
      const existingClient = await sdk.getClient(roomData.id, clientID);

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
    const sdk = await this.getSDK();

    if (!sdk) {
      throw new ServiceError('RoomService', 'sdk not initialized', 500);
    }

    const updateResp = await sdk.setClientName(roomID, clientID, name);

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
    const sdk = await this.getSDK();
    if (!sdk) {
      throw new Error('Failed to get SDK, can be caused by invalid token');
    }

    while (retries < maxRetries) {
      const roomID = generateID();
      const roomResp = await sdk.createRoom('', roomID);

      if (roomResp.code == 409) {
        retries++;
        continue;
      }

      if (roomResp.code > 299) {
        console.error(roomResp.message);
        Sentry.captureMessage(`Failed to create a room ${roomID}.`, 'error');
        throw new Error(
          'Error during creating room, please try again later ' +
            roomResp.message
        );
      }

      for (const datachannel of this._datachannels) {
        const channelResponse = await sdk.createDataChannel(
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
        if (!room) {
          throw new Error('Failed to create room');
        }

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

        console.log(JSON.stringify(error));
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

  async joinRoom(roomId: string): Promise<Room | undefined> {
    Sentry.captureEvent({
      message: 'join room function called',
      level: 'info',
      extra: {
        roomID: roomId,
      },
    });

    const sdk = await this.getSDK();

    if (!sdk) {
      throw new ServiceError('RoomService', 'sdk not initialized', 500);
    }

    const persistent = this._roomRepo.isPersistent();

    if (!persistent) {
      const remoteRoom = await sdk.getRoom(roomId);

      if (remoteRoom.code == 404 || !remoteRoom.data.id) {
        return undefined;
      }

      Sentry.captureEvent({
        message: 'join room function called',
        level: 'info',
        extra: {
          roomID: roomId,
          room: remoteRoom.data,
        },
      });

      return remoteRoom.data;
    }

    const room = await roomRepo.getRoomById(roomId);

    if (!room) {
      return undefined;
    }

    const event = await eventRepo.getByRoomID(room.id);
    let remoteRoom = await sdk.getRoom(roomId);

    if (remoteRoom.code == 404 || !remoteRoom.data.id) {
      remoteRoom = await sdk.createRoom('', roomId);

      if (remoteRoom.code != 201 || !remoteRoom.data.id) {
        throw new ServiceError(
          'RoomService',
          'Failed to create room please try again',
          500
        );
      }

      for (const datachannel of this._datachannels) {
        const channelResponse = await sdk.createDataChannel(
          remoteRoom.data.id,
          datachannel,
          true
        );

        if (!channelResponse || !channelResponse.ok) {
          Sentry.captureException(
            new Error(
              `Failed to create ${datachannel} data channel with room ID ${remoteRoom.data.id}`
            )
          );
        }
      }
    }

    Sentry.captureEvent({
      message: 'join room function called',
      level: 'info',
      extra: {
        roomID: roomId,
        room: remoteRoom.data,
        event: event,
      },
    });

    return { ...room, event };
  }
}
