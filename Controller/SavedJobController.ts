import { Request, Response } from "express";
import ServerError from "../Error/ServerError";
import jose from "jose";
import SavedJobSaveRequest from "../Model/SavedJobSaveRequest";
import SavedJobSaveResponse from "../Model/SavedJobSaveResponse";
import ClientError from "../Error/ClientError";
import Util from "../Util/Util";
import Logger from "../Config/Logger";
import HttpResponse from "../Model/HttpResponse";
import SavedJobUnsaveRequest from "../Model/SavedJobUnsaveRequest";
import SavedJobUnsaveResponse from "../Model/SavedJobUnsaveResponse";
import SavedJobService from "../Service/SavedJobService";
import JobRepository from "../Repository/JobRepository";
import Db from "../Domain/Db";
import Database from "../Config/Database";
import SavedJobRepository from "../Repository/SavedJobRepository";

export default class SavedJobController {
  private savedJobService: SavedJobService;

  public constructor() {
    const db: Db = Database.getDb();

    const jobRepository: JobRepository = new JobRepository(db);

    const savedJobRepository: SavedJobRepository = new SavedJobRepository(db);

    this.savedJobService = new SavedJobService(jobRepository, savedJobRepository);
  }

  public save = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to save - JobController - save(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const savedJobSaveRequest: SavedJobSaveRequest = {
        jobId: Number(req.params.id),
        userId: Number(authorizationHeader.payload.sub),
      };

      const savedJobSaveResponse: SavedJobSaveResponse = await this.savedJobService.save(savedJobSaveRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - SavedJobController - save(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to save - SavedJobController - save(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public unsave = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to unsave - SavedJobController - unsave(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const savedJobUnsaveRequest: SavedJobUnsaveRequest = {
        jobId: Number(req.params.id),
        userId: Number(authorizationHeader.payload.sub),
      };

      const savedJobUnsaveResponse: SavedJobUnsaveResponse = await this.savedJobService.unsave(savedJobUnsaveRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - SavedJobController - unsave(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to unsave - SavedJobController - unsave(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };
}
