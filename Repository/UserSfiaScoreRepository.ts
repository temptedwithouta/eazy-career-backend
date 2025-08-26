import { Prisma } from "@prisma/client";
import Db from "../Domain/Db";
import UserSfiaScore from "../Domain/UserSfiaScore";
import ServerError from "../Error/ServerError";

export default class UserSfiaScoreRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (userSfiaScores: UserSfiaScore[]): Promise<UserSfiaScore[]> => {
    try {
      const dbResponse: UserSfiaScore[] = await this.db.userSfiaScores.createManyAndReturn({
        data: userSfiaScores,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - UserSfiaScoreRepository - save(userSfiaScores: UserSfiaScore[]): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<UserSfiaScore[]> => {
    try {
      const dbResponse: UserSfiaScore[] = await this.db.userSfiaScores.findMany({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - UserSfiaScoreRepository - findByUserId(userId: number): ${e}`);
    }
  };

  public update = async (userSfiaScore: UserSfiaScore): Promise<UserSfiaScore> => {
    try {
      const dbResponse: UserSfiaScore = await this.db.userSfiaScores.update({
        where: {
          userId_sfiaCategoryId: {
            userId: userSfiaScore.userId,
            sfiaCategoryId: userSfiaScore.sfiaCategoryId,
          },
        },
        data: userSfiaScore,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - UserSfiaScoreRepository - update(userSfiaScores: UserSfiaScore[]): ${e}`);
    }
  };
}
