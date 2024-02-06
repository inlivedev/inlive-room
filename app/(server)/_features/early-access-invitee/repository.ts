import { db } from '@/(server)/_shared/database/database';

export const getEarlyAccessInviteeByEmail = async (email: string) => {
  return db.query.earlyAccessInvitees.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
};
