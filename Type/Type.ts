import Job from "../Domain/Job";

interface SfiaScores {
  [key: string]: number;
}

interface Filter {
  [key: string]: string | undefined;
}

export interface RepositoryPaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface RepositorySingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface UserSfiaScores extends SfiaScores {}

export interface JobSfiaScores extends SfiaScores {}

export interface FilterJob extends Filter {}

export interface FilterApplicant extends Filter {}

export interface JobDTO extends Omit<Job, "employmentTypeId" | "statusId" | "userId" | "createdAt" | "updatedAt"> {
  employmentType: string;
  status: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhoneNumber: string;
  recruiterCompany: string;
  recruiterPosition: string;
  applicationStatus: string;
  isSaved: boolean;
  isApplied: boolean;
  isRecommended: boolean;
}

export interface RawJobData extends Omit<Job, "employmentTypeId" | "statusId" | "userId" | "createdAt" | "updatedAt"> {
  employmentType: string;
  status: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhoneNumber: string;
  recruiterCompany: string;
  recruiterPosition: string;
  applicationStatus: string;
  isSaved: boolean;
  isApplied: boolean;
  isRecommended: boolean;
}
