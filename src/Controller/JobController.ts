import Database from "../Config/Database";
import Db from "../Domain/Db";
import JobFindAllRequest from "../Model/JobFindAllRequest";
import JobFindAllResponse from "../Model/JobFindAllResponse";
import JobRepository from "../Repository/JobRepository";
import JobService from "../Service/JobService";
import { Request, Response } from "express";
import ClientError from "../Error/ClientError";
import ServerError from "../Error/ServerError";
import Logger from "../Config/Logger";
import jose from "jose";
import SavedJobRepository from "../Repository/SavedJobRepository";
import JobSaveRequest from "../Model/SavedJobSaveRequest";
import JobSaveResponse from "../Model/SavedJobSaveResponse";
import JobUnsaveResponse from "../Model/SavedJobUnsaveResponse";
import JobUnsaveRequest from "../Model/SavedJobUnsaveRequest";
import HttpResponse from "../Model/HttpResponse";
import dotenv from "dotenv";
import Util from "../Util/Util";
import RoleRepository from "../Repository/RoleRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import JobDeleteRequest from "../Model/JobDeleteRequest";
import JobDeleteResponse from "../Model/JobDeleteResponse";
import JobUpdateRequest from "../Model/JobUpdateRequest";
import JobCreateRequest from "../Model/JobCreateRequest";
import JobCreateResponse from "../Model/JobCreateResponse";
import JobStatusRepository from "../Repository/JobStatusRepository";
import EmploymentTypeRepository from "../Repository/EmploymentTypeRepository";
import UserRepository from "../Repository/UserRepository";
import JobSfiaScoreRepository from "../Repository/JobSfiaScoreRepository";
import SfiaCategoryRepository from "../Repository/SfiaCategoryRepository";
import JobFindByIdRequest from "../Model/JobFindByIdRequest";
import JobFindByIdResponse from "../Model/JobFindByIdResponse";
import JobUpdateResponse from "../Model/JobUpdateResponse";

export default class JobController {
  private jobService: JobService;

  public constructor() {
    const db: Db = Database.getDb();

    const jobRepository: JobRepository = new JobRepository(db);

    const userRoleRepository: UserRoleRepository = new UserRoleRepository(db);

    const roleRepository: RoleRepository = new RoleRepository(db);

    const savedJobRepository: SavedJobRepository = new SavedJobRepository(db);

    const employmentTypeRepository: EmploymentTypeRepository = new EmploymentTypeRepository(db);

    const jobStatusRepository: JobStatusRepository = new JobStatusRepository(db);

    const jobSfiaScoreRepository: JobSfiaScoreRepository = new JobSfiaScoreRepository(db);

    const sfiaCategoryRepository: SfiaCategoryRepository = new SfiaCategoryRepository(db);

    this.jobService = new JobService(jobRepository, userRoleRepository, roleRepository, savedJobRepository, employmentTypeRepository, jobStatusRepository, jobSfiaScoreRepository, sfiaCategoryRepository);
  }

  public create = async (req: Request, res: Response) => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to create - JobController - create(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobCreateRequest: JobCreateRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobCreateResponse: JobCreateResponse = await this.jobService.create(jobCreateRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - create(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to create - JobController - create(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to find all - JobController - findAll(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobFindAllRequest: JobFindAllRequest = {
        userId: Number(authorizationHeader.payload.sub),
        page: Number(req.query.page),
        search: req.query.search ? String(req.query.search) : undefined,
        filter: {
          saved: req.query.saved ? String(req.query.saved) : undefined,
          applied: req.query.applied ? String(req.query.applied) : undefined,
          recommended: req.query.recommended ? String(req.query.recommended) : undefined,
          status: req.query.status ? String(req.query.status) : undefined,
        },
      };

      const jobFindAllResponse: JobFindAllResponse = await this.jobService.findAll(jobFindAllRequest);

      dotenv.config();

      res
        .status(200)
        .json(
          new HttpResponse()
            .setData({ jobs: jobFindAllResponse.data })
            .setPage({ size: Number(`${process.env.PAGINATION_TAKE}`), totalElement: jobFindAllResponse.total, totalPage: Math.ceil(jobFindAllResponse.total / Number(`${process.env.PAGINATION_TAKE}`)), current: Number(req.query.page) })
        )
        .end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - findAll(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to find all - JobController - findAll(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public save = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to save - JobController - save(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobSaveRequest: JobSaveRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobSaveResponse: JobSaveResponse = await this.jobService.save(jobSaveRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - save(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to save - JobController - save(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public unsave = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to unsave - JobController - unsave(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobUnsaveRequest: JobUnsaveRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobUnsaveResponse: JobUnsaveResponse = await this.jobService.unsave(jobUnsaveRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - unsave(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to unsave - JobController - unsave(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to delete - JobController - delete(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobDeleteRequest: JobDeleteRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobDeleteResponse: JobDeleteResponse = await this.jobService.delete(jobDeleteRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - delete(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to delete - JobController - delete(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update - JobController - update(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobUpdateRequest: JobUpdateRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobUpdateResponse: JobUpdateResponse = await this.jobService.update(jobUpdateRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - update(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update - JobController - update(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to find by id - JobController - findById(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobFindByIdRequest: JobFindByIdRequest = {
        id: Number(req.params.id),
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobFindByIdResponse: JobFindByIdResponse = await this.jobService.findById(jobFindByIdRequest);

      res
        .status(200)
        .json(new HttpResponse().setData({ job: jobFindByIdResponse }))
        .end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobController - findByid(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to find by id - JobController - findById(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };
}
