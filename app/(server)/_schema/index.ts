import { rooms } from '@/(server)/_features/room/schema';
import { participants } from '@/(server)/_features/participants/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  rooms,
  participants,
};

export default models;
