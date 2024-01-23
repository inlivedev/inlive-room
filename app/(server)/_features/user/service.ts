import { type InsertUser } from './schema';
import { type UserRepo } from './repository';

export class UserService {
  constructor(private repo: InstanceType<typeof UserRepo>) {}

  async createUser(data: InsertUser) {
    return this.repo.addUser(data);
  }

  async getUserById(userId: number) {
    return this.repo.getUserById(userId);
  }

  async getUserByEmail(email: string) {
    return this.repo.getUserByEmail(email);
  }
}
