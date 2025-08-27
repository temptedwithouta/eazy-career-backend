import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import EmploymentType from "../Domain/EmploymentType";
import { Prisma } from "@prisma/client";

export default class EmploymentTypeRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<EmploymentType | null> => {
    try {
      const dbResponse: EmploymentType | null = await this.db.employmentTypes.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - EmploymentTypeRepository - findByName(name: string): ${e}`);
    }
  };

  public findById = async (id: number): Promise<EmploymentType | null> => {
    try {
      const dbResponse: EmploymentType | null = await this.db.employmentTypes.findUniqueOrThrow({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - EmploymentTypeRepository - findById(id: number): ${e}`);
    }
  };
}
