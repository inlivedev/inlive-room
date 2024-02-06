import { users } from '@/(server)/_features/user/schema';
import { rooms } from '@/(server)/_features/room/schema';
import {
  events,
  participant,
  eventHasParticipant,
} from '../_features/event/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  users,
  rooms,
  events,
  eventHasParticipant,
  participant,
};

export default models;
