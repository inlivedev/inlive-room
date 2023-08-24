import { createRoom, getRoom } from './api/api';
import { createClient } from './client/client';

const factories = {
  createRoom,
  createClient,
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
