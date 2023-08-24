import { createRoom, getRoom, registerClient } from './api/api';

const factories = {
  createRoom,
  createClient: registerClient,
  getRoom,
};

export const Room = (({ createRoom, createClient, getRoom }) => {
  return () => {
    return {
      createRoom,
      createClient,
      getRoom,
    };
  };
})(factories);
