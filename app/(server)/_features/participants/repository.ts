import { db } from '@/(server)/_shared/database/database';
import { iParticipantRepo } from '../room/service';
import { participants } from './schema';
import { Participant } from '../room/routes';
import { and, eq, inArray } from 'drizzle-orm';

export class ParticiantRepo implements iParticipantRepo {
  async addParticipant(participant: Participant): Promise<Participant> {
    const data = await db.insert(participants).values(participant).returning();
    return data[0];
  }

  async getAllParticipant(roomID: string): Promise<Participant[]> {
    const data = await db.query.participants.findMany({
      where: eq(participants.roomID, roomID),
    });
    return data;
  }

  async getByClientID(
    roomID: string,
    clientID: string
  ): Promise<Participant | undefined> {
    const data = await db.query.participants.findFirst({
      where: and(
        eq(participants.clientID, clientID),
        eq(participants.roomID, roomID)
      ),
    });

    return data;
  }

  async getByMultipleClientID(
    roomID: string,
    clientID: string[]
  ): Promise<Participant[]> {
    const data = await db
      .select()
      .from(participants)
      .where(
        and(
          inArray(participants.clientID, clientID),
          eq(participants.roomID, roomID)
        )
      );
    return data;
  }
}
