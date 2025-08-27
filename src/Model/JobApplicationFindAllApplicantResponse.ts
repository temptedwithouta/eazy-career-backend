import User from "../Domain/User";

export default interface JobApplicationFindAllApplicantResponse {
  data: User[];
  total: number;
}
