import Database from "../Config/Database";
import Db from "../Domain/Db";
import JobRepository from "../Repository/JobRepository";
import { Request, Response } from "express";
import ClientError from "../Error/ClientError";
import ServerError from "../Error/ServerError";
import Logger from "../Config/Logger";
import jose from "jose";
import HttpResponse from "../Model/HttpResponse";
import Util from "../Util/Util";
import RoleRepository from "../Repository/RoleRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import JobApplicationRepository from "../Repository/JobApplicationRepository";
import JobApplicationStatusRepository from "../Repository/JobApplicationStatusRepository";
import JobApplicationApplyResponse from "../Model/JobApplicationApplyResponse";
import JobApplicationApplyRequest from "../Model/JobApplicationApplyRequest";
import JobApplicationService from "../Service/JobApplicationService";
import JobApplicationFindAllApplicantRequest from "../Model/JobApplicationFindAllApplicantRequest";
import JobApplicationFindAllApplicantResponse from "../Model/JobApplicationFindAllApplicantResponse";
import dotenv from "dotenv";
import JobApplicationUpdateRequest from "../Model/JobApplicationUpdateRequest";
import JobApplicationUpdateResponse from "../Model/JobApplicationUpdateResponse";

export default class JobApplicationController {
  private jobApplicationService: JobApplicationService;

  public constructor() {
    const db: Db = Database.getDb();

    const jobRepository: JobRepository = new JobRepository(db);

    const userRoleRepository: UserRoleRepository = new UserRoleRepository(db);

    const roleRepository: RoleRepository = new RoleRepository(db);

    const jobApplicationRepository: JobApplicationRepository = new JobApplicationRepository(db);

    const jobApplicationStatusRepository: JobApplicationStatusRepository = new JobApplicationStatusRepository(db);

    this.jobApplicationService = new JobApplicationService(jobRepository, userRoleRepository, roleRepository, jobApplicationRepository, jobApplicationStatusRepository);
  }

  public apply = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to apply - JobApplicationController - apply(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobApplicationApplyRequest: JobApplicationApplyRequest = {
        jobId: Number(req.params.id),
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobApplicationApplyResponse: JobApplicationApplyResponse = await this.jobApplicationService.apply(jobApplicationApplyRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobApplicationController - apply(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to apply - JobApplicationController - apply(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public findAllApplicant = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to find all applicant - JobApplicationController - findAllApplicant(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobApplicationFindAllApplicantRequest: JobApplicationFindAllApplicantRequest = {
        jobId: Number(req.query.jobId),
        userId: Number(authorizationHeader.payload.sub),
        page: Number(req.query.page),
        search: req.query.search ? String(req.query.search) : undefined,
        filter: {
          applicationStatus: req.query.applicationStatus ? String(req.query.applicationStatus) : undefined,
          applied: req.query.applied ? String(req.query.applied) : undefined,
          recommended: req.query.recommended ? String(req.query.recommended) : undefined,
        },
      };

      const jobApplicationFindAllApplicantResponse: JobApplicationFindAllApplicantResponse = await this.jobApplicationService.findAllApplicant(jobApplicationFindAllApplicantRequest);

      dotenv.config();

      res
        .status(200)
        .json(
          new HttpResponse().setData({ applicants: jobApplicationFindAllApplicantResponse.data }).setPage({
            size: Number(`${process.env.PAGINATION_TAKE}`),
            totalElement: jobApplicationFindAllApplicantResponse.total,
            totalPage: Math.ceil(jobApplicationFindAllApplicantResponse.total / Number(`${process.env.PAGINATION_TAKE}`)),
            current: Number(req.query.page),
          })
        )
        .end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobApplicationController - findAllApplicant(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to find all applicant - JobApplicationController - findAllApplicant(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const authorizationHeaderJson: string | undefined = req.headers.authorization;

      if (!authorizationHeaderJson) {
        throw new ServerError(500, `Failed to update - JobApplicationController - update(req: Request, res: Response): Authorization header not found`);
      }

      const authorizationHeader: jose.JWTVerifyResult = JSON.parse(authorizationHeaderJson);

      const jobApplicationUpdateRequest: JobApplicationUpdateRequest = {
        ...req.body,
        userId: Number(authorizationHeader.payload.sub),
      };

      const jobApplicationUpdateResponse: JobApplicationUpdateResponse = await this.jobApplicationService.update(jobApplicationUpdateRequest);

      res.status(200).send().end();
    } catch (e) {
      if (e instanceof ClientError) {
        if (!Util.isObjectEmpty(e.errors.headersErrors)) {
          Logger.getLogger().warn(`Client error - JobApplicationController - update(req: Request, res: Response): ${e.code} - ${JSON.stringify(e.errors)}`);

          res.status(401).send().end();
        } else {
          res.status(e.code).json(new HttpResponse().setErrors(e.errors)).end();
        }
      } else if (e instanceof ServerError) {
        Logger.getLogger().error(e.message);

        res.status(e.code).send().end();
      } else {
        Logger.getLogger().error(`Failed to update - JobApplicationController - update(req: Request, res: Response): ${e}`);

        res.status(500).send().end();
      }
    }
  };
}
