import { iRoomService } from './routes';
import { room } from '@/_shared/utils/sdk';
import Sqids from 'sqids';
import * as Sentry from '@sentry/nextjs';

export interface Room {
  id: string;
  name?: string | null;
  createdBy: number;
}

export interface Participant {
  clientID: string;
  name: string;
  roomID: string | null;
}

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
  isPersistent(): boolean;
}

export class service implements iRoomService {
  _roomRepo: iRoomRepo;
  _sdk = room;

  constructor(roomRepo: iRoomRepo) {
    this._roomRepo = roomRepo;
  }

  async createClient(
    roomId: string,
    clientName: string,
    clientID?: string
  ): Promise<Participant> {
    if (!this._roomRepo.isPersistent()) {
      const clientResponse = await this._sdk.createClient(roomId, {
        clientName: clientName,
      });

      if (clientResponse.code == 409) {
        throw new Error('Unable to create client ID Client ID already exist');
      }

      if (clientResponse.code > 299) {
        throw new Error(
          'Failed to add client to the meeting room. Please try again later!'
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
      throw new Error('room not found');
    }

    const clientResponse = await this._sdk.createClient(roomData.id, {
      clientId: clientID,
      clientName: clientName,
    });

    if (clientResponse.code == 409) {
      throw new Error('Unable to create client ID Client ID already exist');
    }

    if (clientResponse.code > 299) {
      throw new Error(
        'Failed to add client to the meeting room. Please try again later!'
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

    if (updateResp.code > 499) {
      throw new Error(
        'an error has occured on our side please try again later'
      );
    }

    if (updateResp.code > 299) {
      throw new Error(updateResp.message);
    }

    return {
      clientID: updateResp.data.clientId,
      name: updateResp.data.clientName,
      roomID: roomID,
    };
  }

  async createRoom(userID: number): Promise<Room> {
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
        throw new Error('Error during creating room, please try again later');
      }

      const channelResp = await this._sdk.createDataChannel(
        roomID,
        'chat',
        true
      );

      if (!channelResp.ok) {
        Sentry.captureException(
          new Error(`Room ${roomID} : failed to create chat data channel`)
        );
      }

      if (!this._roomRepo.isPersistent()) {
        return {
          id: roomResp.data.roomId,
          createdBy: userID,
        };
      }

      try {
        const room = await this._roomRepo.addRoom({
          id: roomID,
          createdBy: userID,
        });
        return room;
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('duplicate key')) {
          retries++;
          continue;
        } else {
          throw err;
        }
      }
    }

    // Error for logging
    Sentry.captureException(
      new Error('failed to create meeting room : too many retires')
    );

    // Error message given to user
    throw new Error(
      'Failed to create a unique room ID, please try again later'
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

      if (!newRemoteRoom.ok) {
        Sentry.captureException(
          new Error(
            `failed to create room, got ${newRemoteRoom.code} response code from the SDK`
          )
        );
        throw new Error(
          'Error occured during accessing room data, please try again later'
        );
      }

      const channelResponse = await this._sdk.createDataChannel(
        room.id,
        'chat',
        true
      );

      if (!channelResponse.ok) {
        Sentry.captureException(
          new Error(`Room ${room.id} : failed to create chat data channel`)
        );
      }
    }

    return room;
  }
}

const generateRandomNumber = (): number => {
  return Math.floor(Math.random() * 10);
};

const generateID = (): string => {
  const sqids = new Sqids();
  const numArray = [
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
  ];
  return sqids.encode(numArray);
};
