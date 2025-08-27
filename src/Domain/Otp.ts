export default interface Otp {
  id?: number;
  otp: string;
  expiredAt: Date;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
