import { db } from '@/(server)/_shared/database/database';
import { type InsertUser, users } from '@/(server)/_features/user/schema';

export class UserRepo {
  async addUser(data: InsertUser) {
    const user = await db.insert(users).values(data).returning();
    console.log('user', user);
    return user[0];
  }

  async getUserById(userId: number) {
    return db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, userId);
      },
    });
  }

  async getUserByEmail(email: string) {
    return db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, email);
      },
    });
  }
}
