export default interface JobApplicationUpdateRequest {
  jobId: number;
  userId: number;
  applicantId: number;
  applicationStatus: string;
}
