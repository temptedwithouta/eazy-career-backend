import JobFindAllRequest from "../Model/JobFindAllRequest";
import JobFindAllResponse from "../Model/JobFindAllResponse";
import * as validationSchema from "../Validation/ValidationSchema";
import ClientError from "../Error/ClientError";
import Util from "../Util/Util";
import ClientErrors from "../Error/ClientErrors";
import JobRepository from "../Repository/JobRepository";
import Job from "../Domain/Job";
import dotenv from "dotenv";
import JobSaveRequest from "../Model/SavedJobSaveRequest";
import SavedJob from "../Domain/SavedJob";
import SavedJobRepository from "../Repository/SavedJobRepository";
import JobSaveResponse from "../Model/SavedJobSaveResponse";
import JobUnsaveRequest from "../Model/SavedJobUnsaveRequest";
import RoleRepository from "../Repository/RoleRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import UserRole from "../Domain/UserRole";
import Role from "../Domain/Role";
import ServerError from "../Error/ServerError";
import JobDeleteRequest from "../Model/JobDeleteRequest";
import JobDeleteResponse from "../Model/JobDeleteResponse";
import JobUpdateRequest from "../Model/JobUpdateRequest";
import EmploymentType from "../Domain/EmploymentType";
import JobStatus from "../Domain/JobStatus";
import JobUpdateResponse from "../Model/JobUpdateResponse";
import JobCreateRequest from "../Model/JobCreateRequest";
import Database from "../Config/Database";
import { Prisma } from "@prisma/client";
import JobCreateUnitOfWork from "../Infrastructure/JobCreateUnitOfWork";
import JobCreateResponse from "../Model/JobCreateResponse";
import JobUpdateUnitOfWork from "../Infrastructure/JobUpdateUnitOfWork";
import JobSfiaScore from "../Domain/JobSfiaScore";
import SfiaCategory from "../Domain/SfiaCategory";
import JobFindByIdRequest from "../Model/JobFindByIdRequest";
import EmploymentTypeRepository from "../Repository/EmploymentTypeRepository";
import JobStatusRepository from "../Repository/JobStatusRepository";
import JobSfiaScoreRepository from "../Repository/JobSfiaScoreRepository";
import { JobSfiaScores } from "../Type/Type";
import SfiaCategoryRepository from "../Repository/SfiaCategoryRepository";
import JobFindByIdResponse from "../Model/JobFindByIdResponse";

export default class JobService {
  private jobRepository: JobRepository;

  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private savedJobRepository: SavedJobRepository;

  private employmentTypeRepository: EmploymentTypeRepository;

  private jobStatusRepository: JobStatusRepository;

  private jobSfiaScoreRepository: JobSfiaScoreRepository;

  private sfiaCategoryRepository: SfiaCategoryRepository;

  public constructor(
    jobRepository: JobRepository,
    userRoleRepository: UserRoleRepository,
    roleRepository: RoleRepository,
    savedJobRepository: SavedJobRepository,
    employmentTypeRepository: EmploymentTypeRepository,
    jobStatusRepository: JobStatusRepository,
    jobSfiaScoreRepository: JobSfiaScoreRepository,
    sfiaCategoryRepository: SfiaCategoryRepository
  ) {
    this.jobRepository = jobRepository;

    this.userRoleRepository = userRoleRepository;

    this.roleRepository = roleRepository;

    this.savedJobRepository = savedJobRepository;

    this.employmentTypeRepository = employmentTypeRepository;

    this.jobStatusRepository = jobStatusRepository;

    this.jobSfiaScoreRepository = jobSfiaScoreRepository;

    this.sfiaCategoryRepository = sfiaCategoryRepository;
  }

  public create = async (jobCreateRequest: JobCreateRequest): Promise<JobCreateResponse> => {
    const validationResult: JobCreateRequest = this.validateJobCreateRequest(jobCreateRequest);

    const jobCreateResponse: JobCreateResponse = await Database.dbTransaction(async (tx: Prisma.TransactionClient) => {
      const jobCreateUnitOfWork: JobCreateUnitOfWork = new JobCreateUnitOfWork(tx);

      const dbResponseUserRole: UserRole | null = await jobCreateUnitOfWork.getUserRoleRepository().findByUserId(validationResult.userId);

      if (!dbResponseUserRole) {
        throw new ServerError(500, `Failed to create - JobService - create(jobCreateRequest: JobCreateRequest): User role not found`);
      }

      const dbResponseRole: Role | null = await jobCreateUnitOfWork.getRoleRepository().findById(dbResponseUserRole.roleId);

      if (!dbResponseRole) {
        throw new ServerError(500, `Failed to create - JobService - create(jobCreateRequest: JobCreateRequest): Role not found`);
      }

      if (dbResponseRole.name !== "Recruiter") {
        throw new ClientError(
          403,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.sub": ["Role not have access"],
          })
        );
      }

      const dbResponseEmploymentType: EmploymentType | null = await jobCreateUnitOfWork.getEmploymentTypeRepository().findByName(validationResult.employmentType);

      if (!dbResponseEmploymentType) {
        throw new ClientError(
          400,
          "Request not valid",
          new ClientErrors().setBodyErrors({
            "body.employmentType": ["Not valid"],
          })
        );
      }

      const dbResponseJobStatus: JobStatus | null = await jobCreateUnitOfWork.getJobStatusRepository().findByName(validationResult.status);

      if (!dbResponseJobStatus) {
        throw new ClientError(
          400,
          "Request not valid",
          new ClientErrors().setBodyErrors({
            "body.jobStatus": ["Not valid"],
          })
        );
      }

      const job: Job = {
        title: validationResult.title,
        description: validationResult.description,
        requirement: validationResult.requirement,
        location: validationResult.location,
        minSalary: validationResult.minSalary,
        maxSalary: validationResult.maxSalary,
        employmentTypeId: dbResponseEmploymentType.id,
        statusId: dbResponseJobStatus.id,
        userId: validationResult.userId,
      };

      const dbResponseJob: Job = await jobCreateUnitOfWork.getJobRepository().save(job);

      const jobSfiaScores: JobSfiaScore[] = await Promise.all(
        Object.entries(validationResult.sfiaScores).map(async ([key, value]) => {
          const dbResponseSfiaCategory: SfiaCategory | null = await jobCreateUnitOfWork.getSfiaCategoryRepository().findByName(key);

          if (!dbResponseSfiaCategory) {
            throw new ClientError(
              400,
              "Request not valid",
              new ClientErrors().setBodyErrors({
                [`body.sfiaScores.${key}`]: [`Property name not valid`],
              })
            );
          }

          if (!dbResponseJob.id) {
            throw new ServerError(500, `Failed to create - JobService - create(jobCreateRequest: JobCreateRequest): Job id not found`);
          }

          return {
            jobId: dbResponseJob.id,
            sfiaCategoryId: dbResponseSfiaCategory.id,
            score: value,
          };
        })
      );

      const dbResponseJobSfiaScore: JobSfiaScore[] = await jobCreateUnitOfWork.getJobSfiaScoreRepository().save(jobSfiaScores);

      return {
        job: dbResponseJob,
      };
    });

    return jobCreateResponse;
  };

  private validateJobCreateRequest = (jobCreateRequest: JobCreateRequest): JobCreateRequest => {
    const headersValidationResult = validationSchema.JobCreateRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobCreateRequest.userId });

    const bodyValidationResult = validationSchema.JobCreateRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobCreateRequest, "userId"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public findAll = async (jobFindAllRequest: JobFindAllRequest): Promise<JobFindAllResponse> => {
    const validationResult: JobFindAllRequest = this.validateJobFindAllRequest(jobFindAllRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to find all - JobService - findAll(jobFindAllRequest: JobFindAllRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to find all - JobService - findAll(jobFindAllRequest: JobFindAllRequest): Role not found`);
    }

    dotenv.config();

    const take: number = Number(`${process.env.PAGINATION_TAKE}`);

    const skip: number = (validationResult.page - 1) * take;

    const dbResponseJob: { data: Job[]; total: number } = await this.jobRepository.findAll(skip, take, validationResult.userId, dbResponseRole.name, validationResult.search, validationResult.filter);

    return dbResponseJob;
  };

  private validateJobFindAllRequest = (jobFindAllRequest: JobFindAllRequest): JobFindAllRequest => {
    const headersValidationResult = validationSchema.JobFindAllRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobFindAllRequest.userId });

    const queryParamsValidationResult = validationSchema.JobFindAllRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobFindAllRequest, "userId"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!queryParamsValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setQueryParamsErrors(Util.createQueryParamsErrors(queryParamsValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...queryParamsValidationResult.data };
  };

  public save = async (jobSaveRequest: JobSaveRequest): Promise<JobSaveResponse> => {
    const validationResult: JobSaveRequest = this.validateJobSaveRequest(jobSaveRequest);

    const dbResponseJob: Job | null = await this.jobRepository.findById(validationResult.jobId);

    if (!dbResponseJob) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Not valid"],
        })
      );
    }

    const dbResponseSavedJobFindByJobIdAndUserId: SavedJob | null = await this.savedJobRepository.findByJobIdAndUserId(validationResult.jobId, validationResult.userId);

    if (dbResponseSavedJobFindByJobIdAndUserId) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Already saved"],
        })
      );
    }

    const savedJob: SavedJob = {
      jobId: validationResult.jobId,
      userId: validationResult.userId,
    };

    const dbResponseSavedJobSave: SavedJob = await this.savedJobRepository.save(savedJob);

    return {
      savedJob: dbResponseSavedJobSave,
    };
  };

  private validateJobSaveRequest = (jobSaveRequest: JobSaveRequest): JobSaveRequest => {
    const headersValidationResult = validationSchema.JobSaveRequestValidationSchema.omit({ jobId: true }).safeParse({ userId: jobSaveRequest.userId });

    const bodyValidationResult = validationSchema.JobSaveRequestValidationSchema.omit({ userId: true }).safeParse({ jobId: jobSaveRequest.jobId });

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public unsave = async (jobUnsaveRequest: JobUnsaveRequest): Promise<JobSaveResponse> => {
    const validationResult: JobUnsaveRequest = this.validateJobUnsaveRequest(jobUnsaveRequest);

    const dbResponseJob: Job | null = await this.jobRepository.findById(validationResult.jobId);

    if (!dbResponseJob) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Not valid"],
        })
      );
    }

    const dbResponseSavedJobFindByJobIdAndUserId: SavedJob | null = await this.savedJobRepository.findByJobIdAndUserId(validationResult.jobId, validationResult.userId);

    if (!dbResponseSavedJobFindByJobIdAndUserId) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Not saved"],
        })
      );
    }

    const dbResponseSaveJobUnsave: SavedJob = await this.savedJobRepository.delete(validationResult.jobId, validationResult.userId);

    return {
      savedJob: dbResponseSaveJobUnsave,
    };
  };

  private validateJobUnsaveRequest = (jobUnsaveRequest: JobUnsaveRequest): JobSaveRequest => {
    const headersValidationResult = validationSchema.JobUnsaveRequestValidationSchema.omit({ jobId: true }).safeParse({ userId: jobUnsaveRequest.userId });

    const bodyValidationResult = validationSchema.JobUnsaveRequestValidationSchema.omit({ userId: true }).safeParse({ jobId: jobUnsaveRequest.jobId });

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public delete = async (jobDeleteRequest: JobDeleteRequest): Promise<JobDeleteResponse> => {
    const validationResult: JobDeleteRequest = this.validateJobDeleteRequest(jobDeleteRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to delete - JobService - delete(jobDeleteRequest: JobDeleteRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to delete - JobService - delete(jobDeleteRequest: JobDeleteRequest): Role not found`);
    }

    if (dbResponseRole.name !== "Recruiter") {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Role not have access"],
        })
      );
    }

    const dbResponseJobFindById: Job | null = await this.jobRepository.findById(validationResult.jobId);

    if (!dbResponseJobFindById) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Not valid"],
        })
      );
    }

    if (dbResponseJobFindById.userId !== validationResult.userId) {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Recruiter not have access"],
        })
      );
    }

    const dbResponseJobDelete: Job | null = await this.jobRepository.delete(validationResult.jobId);

    return {
      job: dbResponseJobDelete,
    };
  };

  private validateJobDeleteRequest = (jobDeleteRequest: JobDeleteRequest) => {
    const headersValidationResult = validationSchema.JobDeleteRequestValidationSchema.omit({ jobId: true }).safeParse({ userId: jobDeleteRequest.userId });

    const bodyValidationResult = validationSchema.JobDeleteRequestValidationSchema.omit({ userId: true }).safeParse({ jobId: jobDeleteRequest.jobId });

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public update = async (jobUpdateRequest: JobUpdateRequest): Promise<JobUpdateResponse> => {
    const validationResult: JobUpdateRequest = this.validateJobUpdateRequest(jobUpdateRequest);

    const jobUpdateResponse: JobUpdateResponse = await Database.dbTransaction(async (tx: Prisma.TransactionClient) => {
      const jobUpdateUnitOfWork: JobUpdateUnitOfWork = new JobUpdateUnitOfWork(tx);

      const dbResponseUserRole: UserRole | null = await jobUpdateUnitOfWork.getUserRoleRepository().findByUserId(validationResult.userId);

      if (!dbResponseUserRole) {
        throw new ServerError(500, `Failed to update - JobService - update(jobUpdateRequest: JobUpdateRequest): User role not found`);
      }

      const dbResponseRole: Role | null = await jobUpdateUnitOfWork.getRoleRepository().findById(dbResponseUserRole.roleId);

      if (!dbResponseRole) {
        throw new ServerError(500, `Failed to update - JobService - update(jobUpdateRequest: JobUpdateRequest): Role not found`);
      }

      if (dbResponseRole.name !== "Recruiter") {
        throw new ClientError(
          403,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.sub": ["Role not have access"],
          })
        );
      }

      const dbResponseJobFindById: Job | null = await jobUpdateUnitOfWork.getJobRepository().findById(validationResult.id);

      if (!dbResponseJobFindById) {
        throw new ClientError(
          400,
          "Request not valid",
          new ClientErrors().setBodyErrors({
            "body.id": ["Not valid"],
          })
        );
      }

      if (dbResponseJobFindById.userId !== validationResult.userId) {
        throw new ClientError(
          403,
          "Request not valid",
          new ClientErrors().setHeadersErrors({
            "headers.authorization.payload.sub": ["Recruiter not have access"],
          })
        );
      }

      const job: Job = {
        id: validationResult.id,
        title: validationResult.title ?? dbResponseJobFindById.title,
        description: validationResult.description ?? dbResponseJobFindById.description,
        requirement: validationResult.requirement ?? dbResponseJobFindById.requirement,
        location: validationResult.location ?? dbResponseJobFindById.location,
        minSalary: validationResult.minSalary ?? dbResponseJobFindById.minSalary,
        maxSalary: validationResult.maxSalary ?? dbResponseJobFindById.maxSalary,
        employmentTypeId: dbResponseJobFindById.employmentTypeId,
        statusId: dbResponseJobFindById.statusId,
        userId: dbResponseJobFindById.userId,
      };

      if (validationResult.employmentType) {
        const dbResponseEmploymentType: EmploymentType | null = await jobUpdateUnitOfWork.getEmploymentTypeRepository().findByName(validationResult.employmentType);

        if (!dbResponseEmploymentType) {
          throw new ClientError(
            400,
            "Request not valid",
            new ClientErrors().setBodyErrors({
              "body.employmentType": ["Not valid"],
            })
          );
        }

        job["employmentTypeId"] = dbResponseEmploymentType.id;
      }

      if (validationResult.status) {
        const dbResponseJobStatus: JobStatus | null = await jobUpdateUnitOfWork.getJobStatusRepository().findByName(validationResult.status);

        if (!dbResponseJobStatus) {
          throw new ClientError(
            400,
            "Request not valid",
            new ClientErrors().setBodyErrors({
              "body.jobStatus": ["Not valid"],
            })
          );
        }

        job["statusId"] = dbResponseJobStatus.id;
      }

      const dbResponseJobUpdate: Job = await jobUpdateUnitOfWork.getJobRepository().update(job);

      if (validationResult.sfiaScores) {
        const dbResponseJobSfiaScore: JobSfiaScore[] = await Promise.all(
          Object.entries(validationResult.sfiaScores).map(async ([key, value]) => {
            const dbResponseSfiaCategory: SfiaCategory | null = await jobUpdateUnitOfWork.getSfiaCategoryRepository().findByName(key);

            if (!dbResponseSfiaCategory) {
              throw new ClientError(
                400,
                "Request not valid",
                new ClientErrors().setBodyErrors({
                  [`body.sfiaScores.${key}`]: [`Property name not valid`],
                })
              );
            }

            const jobSfiaScore: JobSfiaScore = {
              jobId: validationResult.id,
              sfiaCategoryId: dbResponseSfiaCategory.id,
              score: value,
            };

            const dbResponseJobSfiaScore: JobSfiaScore = await jobUpdateUnitOfWork.getJobSfiaScoreRepository().update(jobSfiaScore);

            return dbResponseJobSfiaScore;
          })
        );
      }

      return {
        job: dbResponseJobUpdate,
      };
    });

    return jobUpdateResponse;
  };

  private validateJobUpdateRequest = (jobUpdateRequest: JobUpdateRequest): JobUpdateRequest => {
    const headersValidationResult = validationSchema.JobUpdateRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobUpdateRequest.userId });

    const bodyValidationResult = validationSchema.JobUpdateRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobUpdateRequest, "userId"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  public findById = async (jobFindByIdRequest: JobFindByIdRequest): Promise<JobFindByIdResponse> => {
    const validationResult: JobFindByIdRequest = this.validateJobFindByIdRequest(jobFindByIdRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to find by id - JobService - findById(jobFindByIdRequest: JobFindByIdRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to find by id - JobService - findById(jobFindByIdRequest: JobFindByIdRequest): Role not found`);
    }

    if (dbResponseRole.name !== "Recruiter") {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Role not have access"],
        })
      );
    }

    const dbResponseJob: Job | null = await this.jobRepository.findById(validationResult.id);

    if (!dbResponseJob) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setRoutePathErrors({
          "routePath.id": ["Not valid"],
        })
      );
    }

    if (dbResponseJob.userId !== validationResult.userId) {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Recruiter not have access"],
        })
      );
    }

    const dbResponseEmploymentType: EmploymentType | null = await this.employmentTypeRepository.findById(dbResponseJob.employmentTypeId);

    if (!dbResponseEmploymentType) {
      throw new ServerError(500, `Failed to find by id - JobService - findById(jobFindByIdRequest: JobFindByIdRequest): Employment type not found`);
    }

    const dbResponseJobStatus: JobStatus | null = await this.jobStatusRepository.findById(dbResponseJob.statusId);

    if (!dbResponseJobStatus) {
      throw new ServerError(500, `Failed to find by id - JobService - findById(jobFindByIdRequest: JobFindByIdRequest): Job status not found`);
    }

    const dbResponseJobSfiaScore: JobSfiaScore[] = await this.jobSfiaScoreRepository.findByJobId(validationResult.id);

    const jobSfiaScores: JobSfiaScores = {};

    await Promise.all(
      dbResponseJobSfiaScore.map(async (item) => {
        const dbResponseSfiaCategory: SfiaCategory | null = await this.sfiaCategoryRepository.findById(item.sfiaCategoryId);

        if (!dbResponseSfiaCategory) {
          throw new ServerError(500, `Failed to find by id - JobService - findById(jobFindByIdRequest: JobFindByIdRequest): Sfia category not found`);
        }

        jobSfiaScores[dbResponseSfiaCategory.name] = item.score;
      })
    );

    return {
      id: validationResult.id,
      title: dbResponseJob.title,
      description: dbResponseJob.description,
      requirement: dbResponseJob.requirement,
      location: dbResponseJob.location,
      minSalary: dbResponseJob.minSalary,
      maxSalary: dbResponseJob.maxSalary,
      employmentType: dbResponseEmploymentType.name,
      status: dbResponseJobStatus.name,
      sfiaScores: jobSfiaScores,
    };
  };

  private validateJobFindByIdRequest = (jobFindByIdRequest: JobFindByIdRequest): JobFindByIdRequest => {
    const headersValidationResult = validationSchema.JobFindByIdRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobFindByIdRequest.userId });

    const routePathValidationResult = validationSchema.JobFindByIdRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobFindByIdRequest, "userId"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!routePathValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setRoutePathErrors(Util.createRoutePathErrors(routePathValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...routePathValidationResult.data };
  };
}
