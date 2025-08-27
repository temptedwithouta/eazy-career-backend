import { JobSfiaScores } from "../Type/Type";

export default interface JobUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  requirement?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  employmentType?: string;
  status?: string;
  sfiaScores?: JobSfiaScores;
  userId: number;
}
