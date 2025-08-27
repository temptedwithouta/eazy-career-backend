export default interface UserUpdatePasswordRequest {
  id: number;
  oldPassword: string;
  newPassword: string;
}
