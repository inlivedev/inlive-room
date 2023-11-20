import { rooms } from '@/(server)/_features/room/schema';
import {
  events,
  participant,
  eventsToParticipant,
} from '../_features/event/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  rooms,
  events,
  eventsToParticipant,
  participant,
};

export default models;
