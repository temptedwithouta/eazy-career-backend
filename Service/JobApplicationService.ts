import * as validationSchema from "../Validation/ValidationSchema";
import ClientError from "../Error/ClientError";
import Util from "../Util/Util";
import ClientErrors from "../Error/ClientErrors";
import JobRepository from "../Repository/JobRepository";
import Job from "../Domain/Job";
import RoleRepository from "../Repository/RoleRepository";
import UserRoleRepository from "../Repository/UserRoleRepository";
import UserRole from "../Domain/UserRole";
import Role from "../Domain/Role";
import ServerError from "../Error/ServerError";
import JobApplicationApplyRequest from "../Model/JobApplicationApplyRequest";
import JobApplication from "../Domain/JobApplication";
import JobApplicationRepository from "../Repository/JobApplicationRepository";
import JobApplicationStatusRepository from "../Repository/JobApplicationStatusRepository";
import JobApplicationStatus from "../Domain/JobApplicationStatus";
import JobApplicationApplyResponse from "../Model/JobApplicationApplyResponse";
import JobApplicationFindAllApplicantRequest from "../Model/JobApplicationFindAllApplicantRequest";
import dotenv from "dotenv";
import User from "../Domain/User";
import JobApplicationFindAllApplicantResponse from "../Model/JobApplicationFindAllApplicantResponse";
import JobApplicationUpdateRequest from "../Model/JobApplicationUpdateRequest";
import JobApplicationUpdateResponse from "../Model/JobApplicationUpdateResponse";

export default class JobApplicationService {
  private jobRepository: JobRepository;

  private userRoleRepository: UserRoleRepository;

  private roleRepository: RoleRepository;

  private jobApplicationRepository: JobApplicationRepository;

  private jobApplicationStatusRepository: JobApplicationStatusRepository;

  public constructor(jobRepository: JobRepository, userRoleRepository: UserRoleRepository, roleRepository: RoleRepository, jobApplicationRepository: JobApplicationRepository, jobApplicationStatusRepository: JobApplicationStatusRepository) {
    this.jobRepository = jobRepository;

    this.userRoleRepository = userRoleRepository;

    this.roleRepository = roleRepository;

    this.jobApplicationRepository = jobApplicationRepository;

    this.jobApplicationStatusRepository = jobApplicationStatusRepository;
  }

  public apply = async (jobApplicationApplyRequest: JobApplicationApplyRequest): Promise<JobApplicationApplyResponse> => {
    const validationResult: JobApplicationApplyRequest = this.validateJobApplicationApplyRequest(jobApplicationApplyRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to apply - JobApplicationService - apply(jobApplicationApplyRequest: JobApplicationApplyRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to apply - JobApplicationService - apply(jobApplicationApplyRequest: JobApplicationApplyRequest): Role not found`);
    }

    if (dbResponseRole.name !== "Candidate") {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["This role not have access"],
        })
      );
    }

    const dbResponseJob: Job | null = await this.jobRepository.findById(validationResult.jobId);

    if (!dbResponseJob) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setRoutePathErrors({
          "routePath.jobId": ["Not valid"],
        })
      );
    }

    const dbResponseJobApplicationFindByJobIdAndUserId: JobApplication | null = await this.jobApplicationRepository.findByJobIdAndUserId(validationResult.jobId, validationResult.userId);

    if (dbResponseJobApplicationFindByJobIdAndUserId) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setRoutePathErrors({
          "routePath.jobId": ["Already applied"],
        })
      );
    }

    const dbResponseJobApplicationStatus: JobApplicationStatus | null = await this.jobApplicationStatusRepository.findByName("Applied");

    if (!dbResponseJobApplicationStatus) {
      throw new ServerError(500, `Failed to apply - JobApplicationService - apply(jobApplicationApplyRequest: JobApplicationApplyRequest): Apply status not found`);
    }

    const jobApplication: JobApplication = {
      jobId: validationResult.jobId,
      userId: validationResult.userId,
      statusId: dbResponseJobApplicationStatus.id,
    };

    const dbResponseJobApplicationSave: JobApplication = await this.jobApplicationRepository.save(jobApplication);

    return {
      jobApplication: dbResponseJobApplicationSave,
    };
  };

  private validateJobApplicationApplyRequest = (jobApplicationApplyRequest: JobApplicationApplyRequest): JobApplicationApplyRequest => {
    const headersValidationResult = validationSchema.JobApplicationApplyRequestValidationSchema.omit({ jobId: true }).safeParse({ userId: jobApplicationApplyRequest.userId });

    const routePathValidationResult = validationSchema.JobApplicationApplyRequestValidationSchema.omit({ userId: true }).safeParse({ jobId: jobApplicationApplyRequest.jobId });

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

  public findAllApplicant = async (jobApplicationFindAllApplicantRequest: JobApplicationFindAllApplicantRequest): Promise<JobApplicationFindAllApplicantResponse> => {
    const validationResult: JobApplicationFindAllApplicantRequest = this.validateJobApplicationFindAllApplicantRequest(jobApplicationFindAllApplicantRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to find all applicant - JobApplicationService - findAllApplicant(jobApplicationFindAllApplicantRequest: JobApplicationFindAllApplicantRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to find all applicant - JobApplicationService - findAllApplicant(jobApplicationFindAllApplicantRequest: JobApplicationFindAllApplicantRequest): Role not found`);
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

    const dbResponseJob: Job | null = await this.jobRepository.findById(validationResult.jobId);

    if (!dbResponseJob) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setQueryParamsErrors({
          "queryParams.jobId": ["Not valid"],
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

    dotenv.config();

    const take: number = Number(`${process.env.PAGINATION_TAKE}`);

    const skip: number = (validationResult.page - 1) * take;

    const dbResponseJobApplication: { data: User[]; total: number } = await this.jobApplicationRepository.findByJobId(skip, take, validationResult.jobId, validationResult.search, validationResult.filter);

    return dbResponseJobApplication;
  };

  private validateJobApplicationFindAllApplicantRequest = (jobApplicationFindAllApplicantRequest: JobApplicationFindAllApplicantRequest): JobApplicationFindAllApplicantRequest => {
    const headersValidationResult = validationSchema.JobApplicationFindAllApplicantRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobApplicationFindAllApplicantRequest.userId });

    const queryParamsValidationResult = validationSchema.JobApplicationFindAllApplicantRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobApplicationFindAllApplicantRequest, "userId"));

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

  public update = async (jobApplicationUpdateRequest: JobApplicationUpdateRequest): Promise<JobApplicationUpdateResponse> => {
    const validationResult: JobApplicationUpdateRequest = this.validateJobApplicationUpdateRequest(jobApplicationUpdateRequest);

    const dbResponseUserRole: UserRole | null = await this.userRoleRepository.findByUserId(validationResult.userId);

    if (!dbResponseUserRole) {
      throw new ServerError(500, `Failed to update - JobApplicationService - update(jobApplicationUpdateRequest: JobApplicationUpdateRequest): User role not found`);
    }

    const dbResponseRole: Role | null = await this.roleRepository.findById(dbResponseUserRole.roleId);

    if (!dbResponseRole) {
      throw new ServerError(500, `Failed to update - JobApplicationService - update(jobApplicationUpdateRequest: JobApplicationUpdateRequest): Role not found`);
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

    if (dbResponseJob.userId !== validationResult.userId) {
      throw new ClientError(
        403,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Recruiter not have access"],
        })
      );
    }

    const dbResponseJobApplicationStatus: JobApplicationStatus | null = await this.jobApplicationStatusRepository.findByName(validationResult.applicationStatus);

    if (!dbResponseJobApplicationStatus) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.applicationStatus": ["Not valid"],
        })
      );
    }

    const dbResponseJobApplicationFindByJobIdAndUserId: JobApplication | null = await this.jobApplicationRepository.findByJobIdAndUserId(validationResult.jobId, validationResult.applicantId);

    if (!dbResponseJobApplicationFindByJobIdAndUserId) {
      throw new ClientError(
        400,
        "Request not valid",
        new ClientErrors().setBodyErrors({
          "body.jobId": ["Not applied"],
        })
      );
    }

    const jobApplication: JobApplication = {
      jobId: validationResult.jobId,
      userId: validationResult.applicantId,
      statusId: dbResponseJobApplicationStatus.id,
    };

    const dbResponseJobApplication: JobApplication = await this.jobApplicationRepository.update(jobApplication);

    return {
      jobApplication: dbResponseJobApplication,
    };
  };

  private validateJobApplicationUpdateRequest = (jobApplicationUpdateRequest: JobApplicationUpdateRequest): JobApplicationUpdateRequest => {
    const headersValidationResult = validationSchema.JobApplicationUpdateRequestValidationSchema.pick({ userId: true }).safeParse({ userId: jobApplicationUpdateRequest.userId });

    const bodyValidationResult = validationSchema.JobApplicationUpdateRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(jobApplicationUpdateRequest, "userId"));

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
}
