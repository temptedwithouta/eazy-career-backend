import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import Otp from "../Domain/Otp";
import { Prisma } from "@prisma/client";

export default class OtpRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (otp: Otp): Promise<Otp> => {
    try {
      const dbResponse: Otp = await this.db.otp.create({
        data: otp,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - OtpRepository - save(otp: Otp): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<Otp | null> => {
    try {
      const dbResponse: Otp | null = await this.db.otp.findUnique({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - OtpRepository - findByUserId(userId: number): ${e}`);
    }
  };

  public update = async (otp: Otp): Promise<Otp> => {
    try {
      const dbResponse: Otp = await this.db.otp.update({
        where: {
          id: otp.id,
        },
        data: otp,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - OtpRepository - update(otp: Otp): ${e}`);
    }
  };

  public delete = async (id: number) => {
    try {
      const dbResponse: Otp = await this.db.otp.delete({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to delete - OtpRepository - delete(id: number): ${e}`);
    }
  };
}
