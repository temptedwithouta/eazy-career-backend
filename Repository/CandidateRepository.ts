import Db from "../Domain/Db";
import Candidate from "../Domain/Candidate";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";

export default class CandidateRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (candidate: Candidate): Promise<Candidate> => {
    try {
      const dbResponse: Candidate = await this.db.candidates.create({
        data: candidate,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - CandidateRepository - save(candidate: Candidate): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<Candidate | null> => {
    try {
      const dbResponse: Candidate | null = await this.db.candidates.findUnique({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - CandidateRepository - findByUserId(userId: number): ${e}`);
    }
  };

  public update = async (candidate: Candidate): Promise<Candidate> => {
    try {
      const dbResponse: Candidate = await this.db.candidates.update({
        where: {
          id: candidate.id,
        },
        data: candidate,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - CandidateRepository - update(candidate: Candidate): ${e}`);
    }
  };
}
