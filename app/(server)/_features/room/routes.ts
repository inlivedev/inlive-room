import { RoomRepo } from '@/(server)/_features/room/repository';
import {
  Participant,
  Room,
  RoomService,
} from '@/(server)/_features/room/service';

export interface iRoomService {
  createRoom(userID: number, type: 'event' | 'meeting'): Promise<Room>;
  joinRoom(roomId: string): Promise<Room | undefined>;
  createClient(
    roomId: string,
    clientName: string,
    clientID?: string
  ): Promise<Participant>;
  setClientName(
    roomID: string,
    clientID: string,
    name: string
  ): Promise<Participant>;
}

const createRoomRoutesHandler = () => {
  const roomHandler = class {
    roomService: iRoomService;

    constructor(roomService: iRoomService) {
      this.roomService = roomService;
    }

    joinRoomHandler = async (roomID: string) => {
      return await this.roomService.joinRoom(roomID);
    };

    registerClientHandler = async (
      roomID: string,
      clientName: string,
      clientID?: string
    ) => {
      return await this.roomService.createClient(roomID, clientName, clientID);
    };

    setClientNameHandler = async (
      roomID: string,
      clientID: string,
      name: string
    ) => {
      return await this.roomService.setClientName(roomID, clientID, name);
    };
  };

  return {
    createInstance: (roomService: iRoomService) => {
      const roomRoutesHandler = new roomHandler(roomService);

      return {
        joinRoomHandler: roomRoutesHandler.joinRoomHandler,
        registerClientHandler: roomRoutesHandler.registerClientHandler,
        setClientNameHandler: roomRoutesHandler.setClientNameHandler,
      };
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(
  new RoomService(new RoomRepo())
);
