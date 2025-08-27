import { FilterJob } from "../Type/Type";

export default interface JobFindAllRequest {
  page: number;
  userId: number;
  search?: string;
  filter: FilterJob;
}
