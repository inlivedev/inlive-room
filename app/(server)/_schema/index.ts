import { rooms } from '@/(server)/_features/room/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  rooms,
};

export default models;
