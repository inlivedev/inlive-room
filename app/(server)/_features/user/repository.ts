import { db } from '@/(server)/_shared/database/database';
import { type InsertUser, users } from '@/(server)/_features/user/schema';
import { UserType } from '@/_shared/types/user';
import { eq } from 'drizzle-orm';

export const addUser = async (data: InsertUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (userId: number) => {
  return db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, userId);
    },
  });
};

export const getUserByEmail = async (email: string) => {
  return db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
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
