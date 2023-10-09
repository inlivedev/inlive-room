import { db } from '@/(server)/_shared/database/database';
import { iParticipantRepo } from '../room/service';
import { participants } from './schema';
import { Participant } from '../room/routes';
import { and, eq, inArray } from 'drizzle-orm';

export class ParticiantRepo implements iParticipantRepo {
  async addParticipant(participant: Participant): Promise<Participant> {
    try {
      const data = await db
        .insert(participants)
        .values(participant)
        .returning();
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllParticipant(roomID: string): Promise<Participant[]> {
    try {
      const data = await db.query.participants.findMany({
        where: eq(participants.roomID, roomID),
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getByClientID(clientID: string): Promise<Participant | undefined> {
    try {
      const data = await db.query.participants.findFirst({
        where: (participants, { eq }) => {
          return eq(participants.clientID, clientID);
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getByMultipleClientID(
    roomID: string,
    clientID: string[]
  ): Promise<Participant[]> {
    try {
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
    } catch (error) {
      throw error;
    }
  }
}
