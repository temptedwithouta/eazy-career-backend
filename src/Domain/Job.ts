export default interface Job {
  id?: number;
  title: string;
  description: string;
  requirement: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  employmentTypeId: number;
  statusId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
