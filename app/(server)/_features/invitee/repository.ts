import { db } from '@/(server)/_shared/database/database';

export const getInviteeByEmail = async (email: string) => {
  return db.query.invitees.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
};
