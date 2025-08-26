import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import Company from "../Domain/Company";
import { Prisma } from "@prisma/client";

export default class CompanyRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<Company | null> => {
    try {
      const dbResponse: Company | null = await this.db.companies.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - CompanyRepository - findByName(name: string): ${e}`);
    }
  };

  public save = async (company: Company): Promise<Company> => {
    try {
      const dbResponse: Company = await this.db.companies.create({
        data: company,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - CompanyRepository - save(company: Company): ${e}`);
    }
  };

  public findById = async (id: number): Promise<Company | null> => {
    try {
      const dbResponse: Company | null = await this.db.companies.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - CompanyRepository - findById(id: number): ${e}`);
    }
  };
}
