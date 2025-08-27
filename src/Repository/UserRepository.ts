import Db from "../Domain/Db";
import User from "../Domain/User";
import ServerError from "../Error/ServerError";
import { Prisma } from "@prisma/client";

export default class UserRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (user: User): Promise<User> => {
    try {
      const dbResponse: User = await this.db.users.create({
        data: user,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - UserRepository - save(user: User): ${e}`);
    }
  };

  public findByEmail = async (email: string): Promise<User | null> => {
    try {
      const dbResponse: User | null = await this.db.users.findUnique({
        where: {
          email: email,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by email - UserRepository - findByEmail(email: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<User | null> => {
    try {
      const dbResponse: User | null = await this.db.users.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - UserRepository - findById(id: number): ${e}`);
    }
  };

  public update = async (user: User): Promise<User> => {
    try {
      const dbResponse: User = await this.db.users.update({
        where: {
          id: user.id,
        },
        data: user,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - UserRepository - update(user: User): ${e}`);
    }
  };
}
