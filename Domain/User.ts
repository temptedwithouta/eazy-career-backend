export default interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  phoneNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}
