import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import JobStatus from "../Domain/JobStatus";
import { Prisma } from "@prisma/client";

export default class JobStatusRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<JobStatus | null> => {
    try {
      const dbResponse: JobStatus | null = await this.db.jobStatus.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - JobStatusRepository - findByName(name: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<JobStatus | null> => {
    try {
      const dbResponse: JobStatus | null = await this.db.jobStatus.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - JobStatusRepository - findById(id: number): ${e}`);
    }
  };
}
