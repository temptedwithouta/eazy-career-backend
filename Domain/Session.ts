export default interface Session {
  id?: number;
  expiredAt: Date;
  sessionTypeId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
