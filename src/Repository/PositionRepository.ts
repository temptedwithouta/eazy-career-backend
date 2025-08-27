import Db from "../Domain/Db";
import ServerError from "../Error/ServerError";
import Position from "../Domain/Position";
import { Prisma } from "@prisma/client";

export default class PositionRepository {
  private db: Db | Prisma.TransactionClient;

  public constructor(db: Db | Prisma.TransactionClient) {
    this.db = db;
  }

  public findByName = async (name: string): Promise<Position | null> => {
    try {
      const dbResponse: Position | null = await this.db.positions.findFirst({
        where: {
          name: name,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by name - PositionRepository - findByName(name: string): ${e}`);
    }
  };

  public save = async (position: Position): Promise<Position> => {
    try {
      const dbResponse: Position = await this.db.positions.create({
        data: position,
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to save - PositionRepository - save(position: Position): ${e}`);
    }
  };

  public findById = async (id: number): Promise<Position | null> => {
    try {
      const dbResponse: Position | null = await this.db.positions.findUnique({
        where: {
          id: id,
        },
      });

      return dbResponse;
    } catch (e) {
      throw new ServerError(500, `Failed to find by id - PositionRepository - findById(id: number): ${e}`);
    }
  };
}
