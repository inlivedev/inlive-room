import { db } from '@/(server)/_shared/database/database';
import { type InsertUser, users } from '@/(server)/_features/user/schema';

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
