import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import Role from "../Domain/Role";
import { Prisma } from "@prisma/client";

export default class RoleRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<Role | null> => {
    try {
      const dbResponse: Role | null = await this.db.roles.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - RoleRepository - findByName(name: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<Role | null> => {
    try {
      const dbResponse: Role | null = await this.db.roles.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - RoleRepository - findById(id: number): ${e}`);
    }
  };
}
