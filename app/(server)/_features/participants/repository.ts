import { db } from '@/(server)/_shared/database/database';
import { Participant, iParticipantRepo } from '../room/service';
import { participants } from './schema';

export class ParticiantRepo implements iParticipantRepo {
  async addParticipant(participant: Participant): Promise<Participant> {
    const data = await db.insert(participants).values(participant).returning();
    return data[0];
  }
}
