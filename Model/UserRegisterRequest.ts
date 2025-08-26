import { UserSfiaScores } from "../Type/Type";

export default interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phoneNumber: string;
  role: string;
  sfiaScores?: UserSfiaScores;
  position?: string;
  company?: string;
}
