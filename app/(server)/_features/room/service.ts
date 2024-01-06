import { iRoomService } from './routes';
import * as Sentry from '@sentry/nextjs';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { serverSDK } from '@/(server)/_shared/utils/sdk';
import { insertRoom, selectRoom } from './schema';

export interface Room {
  id: string;
  name?: string | null;
  createdBy: number;
  meta: { [key: string]: any };
}

export interface Participant {
  clientID: string;
  name: string;
  roomID: string | null;
}

export interface iRoomRepo {
  addRoom(room: typeof insertRoom): Promise<typeof selectRoom>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
  isPersistent(): boolean;
}

export class RoomService implements iRoomService {
  _roomRepo: iRoomRepo;
  _sdk = serverSDK;
  _datachannels: string[];

  constructor(roomRepo: iRoomRepo) {
    this._roomRepo = roomRepo;
    this._datachannels = ['chat', 'moderator'];
  }

  async createClient(roomId: string, clientName: string, clientID?: string) {
    if (!this._roomRepo.isPersistent()) {
      const clientResponse = await this._sdk.createClient(roomId, {
        clientName: clientName,
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

    const clientResponse = await this._sdk.createClient(roomData.id, {
      clientId: clientID,
      clientName: clientName,
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

    const data: Participant = {
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
  ): Promise<Participant> {
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
  ): Promise<typeof selectRoom> {
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
          roomResp.data.roomId,
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
          id: roomResp.data.roomId,
          createdBy: userID,
          meta: { type },
          name: '',
        };
      }

      try {
        const room = await this._roomRepo.addRoom({
          id: roomResp.data.roomId,
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
          id: remoteRoom.data.roomId,
          name: remoteRoom.data.roomName,
          createdBy: 0,
        } as Room;
      }

      return room;
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

    return room;
  }
}
