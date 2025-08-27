import Job from "../Domain/Job";

export default interface JobFindAllResponse {
  data: Job[];
  total: number;
}
