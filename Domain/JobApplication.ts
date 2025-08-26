export default interface JobApplication {
  jobId: number;
  userId: number;
  statusId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
