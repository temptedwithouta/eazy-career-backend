import Db from "../Domain/Db";
import UserRole from "../Domain/UserRole";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";

export default class UserRoleRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (userRole: UserRole): Promise<UserRole> => {
    try {
      const dbResponse: UserRole = await this.db.userRoles.create({
        data: userRole,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - UserRoleRepository - save(userRole: UserRole): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<UserRole | null> => {
    try {
      const dbResponse: UserRole | null = await this.db.userRoles.findFirst({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - UserRoleRepository - findByUserId(userId: number): ${e}`);
    }
  };
}
