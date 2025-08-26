import { FilterApplicant } from "../Type/Type";

export default interface JobApplicationFindAllApplicantRequest {
  jobId: number;
  userId: number;
  page: number;
  search?: string;
  filter: FilterApplicant;
}
