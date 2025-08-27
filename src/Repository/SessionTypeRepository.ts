import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import SessionType from "../Domain/SessionType";
import { Prisma } from "@prisma/client";

export default class SessionTypeRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<SessionType | null> => {
    try {
      const dbResponse: SessionType | null = await this.db.sessionTypes.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - SessionTypeRepository - findByName(name: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<SessionType | null> => {
    try {
      const dbResponse: SessionType | null = await this.db.sessionTypes.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - SessionTypeRepository - findById(id: number): ${e}`);
    }
  };
}
