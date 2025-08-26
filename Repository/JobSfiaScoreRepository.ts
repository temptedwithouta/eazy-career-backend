import { Prisma } from "@prisma/client";
import Db from "../Domain/Db";
import JobSfiaScore from "../Domain/JobSfiaScore";
import ServerError from "../Error/ServerError";

export default class JobSfiaScoreRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (jobSfiaScores: JobSfiaScore[]): Promise<JobSfiaScore[]> => {
    try {
      const dbResponse: JobSfiaScore[] = await this.db.jobSfiaScores.createManyAndReturn({
        data: jobSfiaScores,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - JobSfiaScoreRepository - save(jobSfiaScores: JobSfiaScore[]): ${e}`);
    }
  };

  public findByJobId = async (jobId: number): Promise<JobSfiaScore[]> => {
    try {
      const dbResponse: JobSfiaScore[] = await this.db.jobSfiaScores.findMany({
        where: {
          jobId: jobId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by job id - JobSfiaScoreRepository - findByJobId(jobId: number): ${e}`);
    }
  };

  public update = async (jobSfiaScore: JobSfiaScore): Promise<JobSfiaScore> => {
    try {
      const dbResponse: JobSfiaScore = await this.db.jobSfiaScores.update({
        where: {
          jobId_sfiaCategoryId: {
            jobId: jobSfiaScore.jobId,
            sfiaCategoryId: jobSfiaScore.sfiaCategoryId,
          },
        },
        data: jobSfiaScore,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - JobSfiaScoreRepository - update(jobSfiaScore: JobSfiaScore): ${e}`);
    }
  };
}
