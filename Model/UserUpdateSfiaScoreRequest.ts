import { UserSfiaScores } from "../Type/Type";

export default interface UserUpdateSfiaScoreRequest {
  id: number;
  sfiaScores: UserSfiaScores;
}
