export default interface UserFindByIdResponse {
  name: string;
  email: string;
  dateOfBirth: Date;
  phoneNumber: string;
  portofolio?: string | null;
  aboutMe?: string | null;
  domicile?: string | null;
  position?: string;
  company?: string;
}
