export default interface Candidate {
  id?: number;
  portofolio: string | null;
  aboutMe: string | null;
  domicile: string | null;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
