import { users, usersRelations } from '@/(server)/_features/user/schema';
import { rooms } from '@/(server)/_features/room/schema';
import {
  events,
  eventsRelations,
  participant,
  participantRelations,
  participantRole,
  roleRelations,
} from '../_features/event/schema';
import { earlyAccessInvitees } from '@/(server)/_features/early-access-invitee/schema';
import { activitiesLog } from '../_features/activity-log/schema';

// export all schema here so we can utilize using the drizzle query
const models = {
  users,
  rooms,
  events,
  participant,
  earlyAccessInvitees,
  activitiesLog,
  participantRole,
};

const relations = {
  usersRelations,
  participantRelations,
  eventsRelations,
  roleRelations,
};

const schema = {
  ...models,
  ...relations,
};

export default schema;
