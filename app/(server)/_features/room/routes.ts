import { RoomRepo } from '@/(server)/_features/room/repository';
import {
  Participant,
  Room,
  RoomService,
} from '@/(server)/_features/room/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';

export interface iRoomService {
  createRoom(userID: number): Promise<Room>;
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

    createRoomHandler = async (token: string) => {
      const response = await getCurrentAuthenticated(token);

      if (!response.data.id) {
        throw new Error(
          'Unable to create room because the user is not authenticated'
        );
      }

      return this.roomService.createRoom(response.data.id);
    };

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
        createRoomHandler: roomRoutesHandler.createRoomHandler,
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
