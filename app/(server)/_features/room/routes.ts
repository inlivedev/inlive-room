import { RoomRepo } from '@/(server)/_features/room/repository';
import { Participant, Room, service } from '@/(server)/_features/room/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { ParticiantRepo } from '../participants/repository';

export interface iRoomService {
  createRoom(userID: number): Promise<Room>;
  joinRoom(roomId: string): Promise<Room | undefined>;
  createClient(
    roomId: string,
    clientID: string,
    clientName: string
  ): Promise<Participant>;
  updateClientName(
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
      return this.roomService.createRoom(response.data.id);
    };

    joinRoomHandler = async (roomID: string) => {
      return await this.roomService.joinRoom(roomID);
    };

    registerClientHandler = async (
      roomID: string,
      clientID: string,
      clientName: string
    ) => {
      
    };

    updateClientNameHandler = async (
      roomID: string,
      clientID: string,
      name: string
    ) => {
      return await this.roomService.updateClientName(roomID, clientID, name);
    };
  };

  return {
    createInstance: (roomService: iRoomService) => {
      const roomRoutesHandler = new roomHandler(roomService);

      return {
        createRoomHandler: roomRoutesHandler.createRoomHandler,
        joinRoomHandler: roomRoutesHandler.joinRoomHandler,
        registerClientHandler: roomRoutesHandler.registerClientHandler,
        updateClientNameHandler: roomRoutesHandler.updateClientNameHandler,
      };
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(
  new service(new RoomRepo())
);
