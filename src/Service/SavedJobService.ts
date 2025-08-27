import SavedJobSaveRequest from "../Model/SavedJobSaveRequest";
import SavedJobSaveResponse from "../Model/SavedJobSaveResponse";
import ClientError from "../Error/ClientError";
import ClientErrors from "../Error/ClientErrors";
import SavedJob from "../Domain/SavedJob";
import Job from "../Domain/Job";
import * as validationSchema from "../Validation/ValidationSchema";
import Util from "../Util/Util";
import SavedJobUnsaveRequest from "../Model/SavedJobUnsaveRequest";
import SavedJobUnsaveResponse from "../Model/SavedJobUnsaveResponse";
import JobRepository from "../Repository/JobRepository";
import SavedJobRepository from "../Repository/SavedJobRepository";

export default class SavedJobService {
  private jobRepository: JobRepository;

  private savedJobRepository: SavedJobRepository;

  public constructor(jobRepository: JobRepository, savedJobRepository: SavedJobRepository) {
    this.jobRepository = jobRepository;

    this.savedJobRepository = savedJobRepository;
  }

  public save = async (savedJobSaveRequest: SavedJobSaveRequest): Promise<SavedJobSaveResponse> => {
    const validationResult: SavedJobSaveRequest = this.validateJobSaveRequest(savedJobSaveRequest);

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

  private validateJobSaveRequest = (savedJobSaveRequest: SavedJobSaveRequest): SavedJobSaveRequest => {
    const headersValidationResult = validationSchema.JobSaveRequestValidationSchema.omit({ jobId: true }).safeParse({ userId: savedJobSaveRequest.userId });

    const bodyValidationResult = validationSchema.JobSaveRequestValidationSchema.omit({ userId: true }).safeParse({ jobId: savedJobSaveRequest.jobId });

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

  public unsave = async (jobUnsaveRequest: SavedJobUnsaveRequest): Promise<SavedJobUnsaveResponse> => {
    const validationResult: SavedJobUnsaveRequest = this.validateJobUnsaveRequest(jobUnsaveRequest);

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

  private validateJobUnsaveRequest = (jobUnsaveRequest: SavedJobUnsaveRequest): SavedJobUnsaveRequest => {
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
}
