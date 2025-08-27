import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const name = z.string().trim().min(2).max(500);

const email = z.string().trim().email().min(5).max(500);

const password = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-_])[A-Za-z0-9#?!@$%^&*-_]{8,20}$/), "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");

const dateOfBirth = z.string().trim().date();

const phoneNumber = z
  .string()
  .trim()
  .min(10)
  .max(20)
  .regex(new RegExp(/^[0-9]{10,20}$/), "Phone number must be a valid number");

const role = z.string().trim().min(2).max(500);

const userSfiaScores = z.object({}).catchall(z.number());

const position = z.string().trim().min(2).max(500);

const company = z.string().trim().min(2).max(500);

const otp = z.string().trim().length(Number(process.env.OTP_LENGTH));

const iss = z.string().trim();

const sub = z.string().trim();

const aud = z.string().trim();

const exp = z.number();

const nbf = z.number();

const iat = z.number();

const jti = z.string().trim();

const typ = z.string().trim();

const alg = z.string().trim();

const kid = z.string().trim();

const page = z.number().int();

const userId = z.number().int();

const jobSearch = z.string().trim().min(1).max(500);

const jobSaved = z.enum(["true", "false"]);

const jobApplied = z.enum(["true", "false"]);

const jobRecommended = z.enum(["true", "false"]);

const applicantRecommended = z.enum(["true", "false"]);

const jobId = z.number().int();

const id = z.number().int();

const title = z.string().trim().min(2).max(500);

const description = z.string().trim().min(2).max(2000);

const requirement = z.string().trim().min(2).max(2000);

const location = z.string().trim().min(2);

const minSalary = z.number().int();

const maxSalary = z.number().int();

const employmentType = z.string().trim().min(2).max(500);

const jobStatus = z.string().trim().min(2).max(500);

const applicationStatus = z.string().trim().min(2).max(500);

const portofolio = z.string().trim().url().min(2).max(500);

const aboutMe = z.string().trim().min(2).max(2000);

const domicile = z.string().trim().min(2).max(2000);

const jobSfiaScores = z.object({}).catchall(z.number());

const applicantSearch = z.string().trim().min(1).max(500);

const applicantId = z.number().int();

const applicantApplied = z.enum(["true", "false"]);

const jobFilter = z
  .object({
    saved: jobSaved.optional(),
    applied: jobApplied.optional(),
    recommended: jobRecommended.optional(),
    status: jobStatus.optional(),
  })
  .strict();

const applicantFilter = z
  .object({
    applicationStatus: applicationStatus.optional(),
    applied: applicantApplied.optional(),
    recommended: applicantRecommended.optional(),
  })
  .strict();

const otpTokenHeader = z
  .object({
    alg,
    typ,
    kid,
  })
  .strict();

const otpTokenPayload = z
  .object({
    iss,
    sub,
    aud,
    exp,
    nbf,
    iat,
    jti,
  })
  .strict();

export const UserRegisterRequestValidationSchema = z
  .object({
    name: name,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth,
    phoneNumber: phoneNumber,
    role: role,
    sfiaScores: userSfiaScores.optional(),
    position: position.optional(),
    company: company.optional(),
  })
  .strict();

export const OtpSendRequestValidationSchema = z.object({ userId: userId, email: email.optional() }).strict();

export const OtpResendRequestValidationSchema = z.object({ email }).strict();

export const OtpVerifyRequestValidationSchema = z.object({ userId, otp }).strict();

export const UserLoginRequestValidationSchema = z
  .object({
    email,
    password,
  })
  .strict();

export const OtpTokenValidationSchema = z
  .object({
    protectedHeader: otpTokenHeader,
    payload: otpTokenPayload,
  })
  .strict();

export const JobFindAllRequestValidationSchema = z
  .object({
    page: page,
    userId: userId,
    search: jobSearch.optional(),
    filter: jobFilter,
  })
  .strict();

export const AuthTokenValidationSchema = z
  .object({
    protectedHeader: otpTokenHeader,
    payload: otpTokenPayload,
  })
  .strict();

export const JobSaveRequestValidationSchema = z
  .object({
    jobId,
    userId,
  })
  .strict();

export const JobUnsaveRequestValidationSchema = z
  .object({
    jobId,
    userId,
  })
  .strict();

export const JobApplicationApplyRequestValidationSchema = z
  .object({
    jobId,
    userId,
  })
  .strict();

export const JobDeleteRequestValidationSchema = z
  .object({
    jobId,
    userId,
  })
  .strict();

export const JobUpdateRequestValidationSchema = z
  .object({
    id,
    title: title.optional(),
    description: description.optional(),
    requirement: requirement.optional(),
    location: location.optional(),
    minSalary: minSalary.optional(),
    maxSalary: maxSalary.optional(),
    employmentType: employmentType.optional(),
    status: jobStatus.optional(),
    sfiaScores: jobSfiaScores.optional(),
    userId: userId,
  })
  .strict();

export const UserFindByIdRequestValidationSchema = z
  .object({
    id,
  })
  .strict();

export const UserFindSfiaScoreRequestValidationSchema = z
  .object({
    id,
  })
  .strict();

export const UserUpdateRequestValidationSchema = z
  .object({
    id: id,
    name: name,
    dateOfBirth: dateOfBirth,
    phoneNumber: phoneNumber,
    portofolio: portofolio.optional(),
    aboutMe: aboutMe.optional(),
    domicile: domicile.optional(),
    position: position.optional(),
    company: company.optional(),
  })
  .strict();

export const UserUpdateSfiaScoreRequestValidationSchema = z
  .object({
    id: id,
    sfiaScores: userSfiaScores,
  })
  .strict();

export const UserUpdatePasswordRequestValidationSchema = z
  .object({
    id: id,
    oldPassword: password,
    newPassword: password,
  })
  .strict();

export const UserUpdateEmailRequestValidationSchema = z
  .object({
    id: id,
    newEmail: email,
  })
  .strict();

export const JobCreateRequestValidationSchema = z
  .object({
    title: title,
    description: description,
    requirement: requirement,
    location: location,
    minSalary: minSalary,
    maxSalary: maxSalary,
    employmentType: employmentType,
    status: jobStatus,
    sfiaScores: jobSfiaScores,
    userId: userId,
  })
  .strict();

export const JobApplicationFindAllApplicantRequestValidationSchema = z
  .object({
    jobId,
    userId,
    page: page,
    search: applicantSearch.optional(),
    filter: applicantFilter,
  })
  .strict();

export const JobFindByIdRequestValidationSchema = z
  .object({
    id: jobId,
    userId: userId,
  })
  .strict();

export const JobApplicationUpdateRequestValidationSchema = z
  .object({
    jobId,
    userId,
    applicantId,
    applicationStatus,
  })
  .strict();

export const JobRecommendationFindAllRecommendedApplicantRequestValidationSchema = z
  .object({
    jobId,
    userId,
  })
  .strict();
