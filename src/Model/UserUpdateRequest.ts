export default interface UserUpdateRequest {
  id: number;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  portofolio?: string;
  aboutMe?: string;
  domicile?: string;
  position?: string;
  company?: string;
}
