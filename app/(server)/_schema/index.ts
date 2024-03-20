import { users, usersRelations } from '@/(server)/_features/user/schema';
import { rooms } from '@/(server)/_features/room/schema';
import {
  events,
  participant,
  eventHasParticipant,
  eventsRelation,
  eventHasParticipantRelation,
  participantRelation,
} from '../_features/event/schema';
import { earlyAccessInvitees } from '@/(server)/_features/early-access-invitee/schema';
import { activitiesLog } from '../_features/activity-log/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  users,
  rooms,
  events,
  eventHasParticipant,
  participant,
  earlyAccessInvitees,
  activitiesLog,
};

const relations = {
  eventsRelation,
  eventHasParticipantRelation,
  participantRelation,
  usersRelations,
};

const schema = {
  ...models,
  ...relations,
};

export default schema;
