import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import JobApplicationStatus from "../Domain/JobApplicationStatus";
import { Prisma } from "@prisma/client";

export default class JobApplicationStatusRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<JobApplicationStatus | null> => {
    try {
      const dbResponse: JobApplicationStatus | null = await this.db.jobApplicationStatus.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - JobApplicationStatusRepository - findByName(name: string): ${e}`);
    }
  };
}
