import Db from "../Domain/Db";
import Recruiter from "../Domain/Recruiter";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";

export default class RecruiterRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (recruiter: Recruiter): Promise<Recruiter> => {
    try {
      const dbResponse: Recruiter = await this.db.recruiters.create({
        data: recruiter,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - RecruiterRepository - save(recruiter: Recruiter): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<Recruiter | null> => {
    try {
      const dbResponse: Recruiter | null = await this.db.recruiters.findUnique({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - RecruiterRepository - findByUserId(userId: number): ${e}`);
    }
  };

  public update = async (recruiter: Recruiter): Promise<Recruiter> => {
    try {
      const dbResponse: Recruiter = await this.db.recruiters.update({
        where: {
          id: recruiter.id,
        },
        data: recruiter,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - RecruiterRepository - update(recruiter: Recruiter): ${e}`);
    }
  };
}
