import Db from "../Domain/Db";
import { Prisma, PrismaClient } from "@prisma/client";

export default class Database {
  private static db: Db;

  private constructor() {}

  public static getDb = (): Db => {
    if (!Database.db) {
      Database.db = new PrismaClient();
    }

    return Database.db;
  };

  public static dbTransaction = async (callback: (tx: Prisma.TransactionClient) => Promise<any>): Promise<any> => {
    return await Database.getDb().$transaction(async (tx) => {
      return await callback(tx);
    });
  };
}
