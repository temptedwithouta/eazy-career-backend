import OtpSendRequest from "../Model/OtpSendRequest";
import UserRepository from "../Repository/UserRepository";
import ClientError from "../Error/ClientError";
import ClientErrors from "../Error/ClientErrors";
import * as validationSchema from "../Validation/ValidationSchema";
import Util from "../Util/Util";
import OtpSendResponse from "../Model/OtpSendResponse";
import User from "../Domain/User";
import Otp from "../Domain/Otp";
import OtpRepository from "../Repository/OtpRepository";
import fs from "fs/promises";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Email from "../Config/Email";
import OtpVerifyRequest from "../Model/OtpVerifyRequest";
import OtpVerifyResponse from "../Model/OtpVerifyResponse";

export default class OtpService {
  private userRepository: UserRepository;

  private otpRepository: OtpRepository;

  public constructor(userRepository: UserRepository, otpRepository: OtpRepository) {
    this.userRepository = userRepository;

    this.otpRepository = otpRepository;
  }

  public send = async (otpSendRequest: OtpSendRequest): Promise<OtpSendResponse> => {
    const validationResult: OtpSendRequest = this.validateOtpSendRequest(otpSendRequest);

    const dbResponseUser: User | null = await this.userRepository.findById(validationResult.userId);

    if (!dbResponseUser || !dbResponseUser.id) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    }

    dotenv.config();

    const otpNumber: string = Util.generateOtp(Number(process.env.OTP_LENGTH));

    if (validationResult.email) {
      await this.sendOtpEmail(validationResult.email, dbResponseUser.name, otpNumber);
    } else {
      await this.sendOtpEmail(dbResponseUser.email, dbResponseUser.name, otpNumber);
    }

    const currentTimestamp: Date = new Date();

    const currentTime: number = currentTimestamp.getTime();

    const otpExpired: Date = new Date();

    otpExpired.setTime(currentTime + 15 * 60 * 1000);

    const dbResponseOtpFindByUserId: Otp | null = await this.otpRepository.findByUserId(dbResponseUser.id);

    if (dbResponseOtpFindByUserId) {
      const otp: Otp = {
        id: dbResponseOtpFindByUserId.id,
        otp: otpNumber,
        expiredAt: otpExpired,
        userId: dbResponseOtpFindByUserId.userId,
      };

      const dbResponseOtpUpdate = await this.otpRepository.update(otp);

      return {
        otp: dbResponseOtpUpdate,
      };
    } else {
      const otp: Otp = {
        otp: otpNumber,
        expiredAt: otpExpired,
        userId: dbResponseUser.id,
      };

      const dbResponseOtpSave: Otp = await this.otpRepository.save(otp);

      return {
        otp: dbResponseOtpSave,
      };
    }
  };

  private validateOtpSendRequest = (otpSendRequest: OtpSendRequest): OtpSendRequest => {
    const headersValidationResult = validationSchema.OtpSendRequestValidationSchema.pick({ userId: true }).safeParse({ userId: otpSendRequest.userId });

    const bodyValidationResult = validationSchema.OtpSendRequestValidationSchema.omit({ userId: true }).safeParse(Util.deleteObjectProperty(otpSendRequest, "userId"));

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };

  private sendOtpEmail = async (receiver: string, name: string, otp: string): Promise<void> => {
    await Util.isFileExist("View/Template/Email/Otp.html");

    const templateEmail: string = await fs.readFile(`${__dirname}/../View/Template/Email/Otp.html`, "utf-8");

    dotenv.config();

    const message: nodemailer.SendMailOptions = {
      from: `${process.env.EMAIL}`,
      to: [receiver],
      subject: "EazyCareer - Email Verification - One Time Password (OTP)",
      html: Util.formatHtml(templateEmail, { name: name, otp: otp }),
    };

    await Email.send(message);
  };

  public verify = async (otpVerifyRequest: OtpVerifyRequest): Promise<OtpVerifyResponse> => {
    const validationResult: OtpVerifyRequest = this.validateOtpVerifyRequest(otpVerifyRequest);

    const dbResponseOtp: Otp | null = await this.otpRepository.findByUserId(validationResult.userId);

    if (!dbResponseOtp || !dbResponseOtp.id) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors({ "body.otp": ["Not valid"] }));
    }

    if (dbResponseOtp.otp !== validationResult.otp) {
      throw new ClientError(401, "Request not valid", new ClientErrors().setBodyErrors({ "body.otp": ["Not valid"] }));
    }

    if (dbResponseOtp.expiredAt < new Date()) {
      throw new ClientError(401, "Request not valid", new ClientErrors().setBodyErrors({ "body.otp": ["Expired"] }));
    }

    await this.otpRepository.delete(dbResponseOtp.id);

    return {
      otp: dbResponseOtp,
    };
  };

  private validateOtpVerifyRequest = (otpVerifyRequest: OtpVerifyRequest): OtpVerifyRequest => {
    const headersValidationResult = validationSchema.OtpVerifyRequestValidationSchema.omit({ otp: true }).safeParse({ userId: otpVerifyRequest.userId });

    const bodyValidationResult = validationSchema.OtpVerifyRequestValidationSchema.omit({ userId: true }).safeParse({
      otp: otpVerifyRequest.otp,
    });

    if (!headersValidationResult.success) {
      throw new ClientError(
        401,
        "Request not valid",
        new ClientErrors().setHeadersErrors({
          "headers.authorization.payload.sub": ["Not valid"],
        })
      );
    } else if (!bodyValidationResult.success) {
      throw new ClientError(400, "Request not valid", new ClientErrors().setBodyErrors(Util.createBodyErrors(bodyValidationResult.error)));
    }

    return { ...headersValidationResult.data, ...bodyValidationResult.data };
  };
}
