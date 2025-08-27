import Db from "../Domain/Db";
import { Prisma } from "@prisma/client";
import Session from "../Domain/Session";
import ServerError from "../Error/ServerError";

export default class SessionRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public save = async (session: Session): Promise<Session> => {
    try {
      const dbResponse: Session = await this.db.sessions.create({
        data: session,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - SessionRepository - save(session: Session): ${e}`);
    }
  };

  public findByUserId = async (userId: number): Promise<Session | null> => {
    try {
      const dbResponse: Session | null = await this.db.sessions.findUnique({
        where: {
          userId: userId,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by user id - SessionRepository - findByUserId(userId: number): ${e}`);
    }
  };

  public update = async (session: Session): Promise<Session> => {
    try {
      const dbResponse: Session = await this.db.sessions.update({
        where: {
          id: session.id,
        },
        data: session,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to update - SessionRepository - update(session: Session): ${e}`);
    }
  };

  public findById = async (id: number): Promise<Session | null> => {
    try {
      const dbResponse: Session | null = await this.db.sessions.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - SessionRepository - findById(userId: number): ${e}`);
    }
  };
}
