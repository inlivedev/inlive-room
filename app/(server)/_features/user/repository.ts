import { DB, db } from '@/(server)/_shared/database/database';
import {
  type InsertUser,
  users,
  selectUser,
} from '@/(server)/_features/user/schema';
import { UserType } from '@/_shared/types/user';
import { eq } from 'drizzle-orm';

export const addUser = (data: InsertUser) => {
  return db.insert(users).values(data).returning();
};

export const getUserById = (userId: number, _db: DB = db) => {
  return _db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, userId);
    },
  });
};

export const getUserByEmail = async (email: string, _db: DB = db) => {
  return _db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
};

export const activateUser = async (
  userId: number,
  options?: Partial<
    Pick<selectUser, 'pictureUrl' | 'whitelistFeature' | 'name'>
  >,
  _db: DB = db
) => {
  return _db
    .update(users)
    .set({ ...options, isRegistered: true })
    .where(eq(users.id, userId));
};

export const addWhiteListFeature = async (
  userId: number,
  feature: UserType.Feature
) => {
  const res = await db.transaction(async (tx) => {
    const whitelistedFeature = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { whitelistFeature: true },
    });

    if (!whitelistedFeature) {
      return await tx
        .update(users)
        .set({ whitelistFeature: [feature] })
        .returning();
    }

    if (whitelistedFeature) {
      const newWhitelist = [...whitelistedFeature.whitelistFeature, feature];
      return await tx.update(users).set({ whitelistFeature: newWhitelist });
    }
  });

  return res;
};
