import { RoomRepo } from '@/(server)/_features/room/repository';
import { service } from '@/(server)/_features/room/service';
import { getUserFromToken } from '@/(server)/_shared/utils/auth';
import { roomService as iRoomService } from './interface';

const createRoomRoutesHandler = () => {
  const roomHandler = class {
    roomService: iRoomService;

    constructor(roomService: iRoomService) {
      this.roomService = roomService;
    }

    createRoomHandler = async (token: string) => {
      const userData = await getUserFromToken(token);

      if (!userData) {
        throw new Error('failed to get user data');
      }

      return this.roomService.createRoom(userData.id);
    };
  };

  return {
    createInstance: (roomService: iRoomService) => {
      const roomRoutesHandler = new roomHandler(roomService);

      return {
        createRoomHandler: roomRoutesHandler.createRoomHandler,
      };
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(
  new service(new RoomRepo())
);
