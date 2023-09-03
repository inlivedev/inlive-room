import { facade } from './facade/facade';

const createRoom = (facade: RoomFacadeType.Facade) => {
  return (config: RoomType.UserConfig) => {
    return facade.createInstance(config);
  };
};

export const Room = createRoom(facade);
