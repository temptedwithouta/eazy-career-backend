import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import SfiaCategory from "../Domain/SfiaCategory";
import { Prisma } from "@prisma/client";

export default class SfiaCategoryRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<SfiaCategory | null> => {
    try {
      const dbResponse: SfiaCategory | null = await this.db.sfiaCategories.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - SfiaCategoryRepository - findByName(name: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<SfiaCategory | null> => {
    try {
      const dbResponse: SfiaCategory | null = await this.db.sfiaCategories.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - SfiaCategoryRepository - findById(id: number): ${e}`);
    }
  };
}
