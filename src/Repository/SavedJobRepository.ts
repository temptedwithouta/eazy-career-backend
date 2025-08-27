import Db from "../Domain/Db";
import SavedJob from "../Domain/SavedJob";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";

export default class SavedJobRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (savedJob: SavedJob): Promise<SavedJob> => {
    try {
      const dbResponse: SavedJob = await this.db.savedJobs.create({
        data: savedJob,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - SavedJobRepository - save(savedJob: SavedJob): ${e}`);
    }
  };

  public findByJobIdAndUserId = async (jobId: number, userId: number): Promise<SavedJob | null> => {
    try {
      const dbResponse: SavedJob | null = await this.db.savedJobs.findUnique({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: userId,
          },
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by job id and user id - SavedJobRepository - findByJobIdAndUserId(jobId: number, userId: number): ${e}`);
    }
  };

  public delete = async (jobId: number, userId: number): Promise<SavedJob> => {
    try {
      const dbResponse: SavedJob = await this.db.savedJobs.delete({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: userId,
          },
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to delete - SavedJobRepository - delete(savedJob: SavedJob): ${e}`);
    }
  };
}
